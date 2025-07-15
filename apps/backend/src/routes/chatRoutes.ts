import { customerAuth, geniusAuth } from "@/auth";
import { db } from "@/db";
import { sendNewConversationsToGenius } from "@/helper/chat";
import { PubSubBroker } from "@/helper/PubSubBroker";
import { conversations, messages, eq } from "@ek/db";
import { getData, type SocketMessage } from "@ek/shared";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

type User = (typeof customerAuth)["$Infer"]["Session"]["user"];

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
    const [customerSession, geniusSession] = await Promise.all([
      customerAuth.api.getSession({ headers: c.req.raw.headers }),
      geniusAuth.api.getSession({ headers: c.req.raw.headers }),
    ]);

    const user = customerSession?.user || geniusSession?.user || null;

    if (!user) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    c.set("user", user);

    return next();
  })
  .get(
    "/",
    upgradeWebSocket(async (c) => {
      return {
        onOpen: async (_, ws) => {
          broker.subscribeAll(ws);

          await sendNewConversationsToGenius(broker, [ws]);
        },
        onClose: async (_, ws) => {
          broker.unsubscribeAll(ws);
        },
      };
    }),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket(async (c) => {
      const user = c.get("user") as User;
      const convId = c.req.param("conversationId");
      const [conv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, convId));

      return {
        onOpen: async (_, ws) => {
          broker.subscribe(convId, ws, { status: conv.status || "init" });

          let status = conv.status;

          if (user.role === "genius" && status === "init") {
            await db.update(conversations).set({ status: "active" });
            status = "active";
          }

          broker.publish(
            convId,
            {
              event: "join-conversation",
              data: {
                userName: user.name,
                conversationStatus: status ?? undefined,
              },
            },
            ws,
          );

          await sendNewConversationsToGenius(broker);
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
          await sendNewConversationsToGenius(broker);
        },
      };
    }),
  );

export { chatRoutes };

export type ChatRoutes = typeof routes;
