import { customerAuth, geniusAuth } from "@/auth";
import { db } from "@/db";
import { publishNewConversationsToGenius } from "@/helper/chat";
import { PubSubBroker } from "@/helper/PubSubBroker";
import { conversations, messages, eq } from "@ek/db";
import { getData, type SocketMessage } from "@ek/shared";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

type User = (typeof customerAuth)["$Infer"]["Session"]["user"];

export const GENIUS_WAITING_ROOM = "GENIUS_WAITING_ROOM";

const chatRoutes = new Hono<{
  Variables: {
    user: User;
  };
}>().basePath("/chat");
const broker = new PubSubBroker<SocketMessage, { status: string }>();

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: chatRoutes,
});

const routes = chatRoutes
  .use(async (c, next) => {
    const customerSession = await customerAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (customerSession) {
      c.set("user", customerSession?.user || null);
      return next();
    }

    const geniusSession = await geniusAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (geniusSession) {
      c.set("user", geniusSession?.user || null);
      return next();
    }

    return c.json(null, 403);
  })
  .get(
    "/",
    upgradeWebSocket(async (c) => {
      return {
        onOpen: async (_, ws) => {
          broker.subscribe(GENIUS_WAITING_ROOM, ws);

          await publishNewConversationsToGenius(broker);
        },
        onClose: async (_, ws) => {
          broker.unsubscribe(GENIUS_WAITING_ROOM, ws);
        },
      };
    }),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket(async (c) => {
      const convId = c.req.param("conversationId");
      const user = c.get("user") as User;

      return {
        onOpen: async (_, ws) => {
          let [conv] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, convId));

          broker.subscribe(convId, ws, { status: conv.status || "init" });

          if (user.role === "genius" && conv.status === "init") {
            conv = (
              await db
                .update(conversations)
                .set({ status: "active" })
                .where(eq(conversations.id, convId))
                .returning()
            ).at(0)!;
          }

          broker.publish(
            convId,
            {
              event: "join-conversation",
              data: {
                userName: user.name,
                conversationStatus: conv.status ?? undefined,
              },
            },
            ws,
          );

          await publishNewConversationsToGenius(broker);
        },
        onMessage: async (event, ws) => {
          const wsData = getData(event.data.toString());

          switch (wsData.event) {
            case "message": {
              const data = wsData.data;

              await db.insert(messages).values({
                content: data.content,
                userId: user.id,
                conversationId: convId,
                createdAt: data.createdAt,
              });
            }
          }

          broker.publish(convId, wsData, ws);
        },
        onClose: async (_, ws) => {
          broker.publish(
            convId,
            {
              event: "quit-conversation",
              data: { userName: user.name },
            },
            ws,
          );
          broker.unsubscribe(convId, ws);
          await publishNewConversationsToGenius(broker);
        },
      };
    }),
  );

export { chatRoutes };

export type ChatRoutes = typeof routes;
