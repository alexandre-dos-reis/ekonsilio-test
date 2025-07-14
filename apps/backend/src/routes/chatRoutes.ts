import { PubSubBroker } from "@/helper/PubSubBroker";
import type { App } from "@/types";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { type SocketMessage, getData } from "@ek/shared";
import { db } from "@/db";
import { messages } from "@ek/db";

const routes = new Hono<App>().basePath("/chat");

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: routes,
});

const broker = new PubSubBroker<SocketMessage>();

const chatRoutes = routes
  .get(
    "/all",
    upgradeWebSocket((c) => {
      return {
        onOpen: (_, ws) => {
          console.log("subscribeAll");
          broker.subscribeAll(ws);
        },
        onClose: (_, ws) => {
          console.log("unsubscribeAll");
          broker.unsubscribeAll(ws);
        },
      };
    }),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket((c) => {
      const convId = c.req.param("conversationId");

      return {
        onOpen: (_, ws) => {
          broker.subscribe(convId, ws);
        },
        onMessage: async (event, ws) => {
          const wsData = getData(event.data.toString());

          switch (wsData.event) {
            case "message": {
              const data = wsData.data;

              await db.insert(messages).values({
                content: data.content,
                userId: data.user.id,
                conversationId: convId,
                createdAt: data.createdAt,
              });
            }
          }

          broker.publish(convId, wsData, ws);
        },
        onClose: (_, ws) => {
          broker.unsubscribe(convId, ws);
        },
      };
    }),
  );

export { chatRoutes };

export type ChatRoutes = typeof chatRoutes;
