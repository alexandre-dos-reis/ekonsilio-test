import { PubSubBroker } from "@/helper/PubSubBroker";
import type { App } from "@/types";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

export const chatRoutes = new Hono<App>().basePath("/chat");

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: chatRoutes,
});

const broker = new PubSubBroker();

chatRoutes
  .get(
    "/",
    upgradeWebSocket((c) => {
      const genius = c.get("genius");

      return {
        onOpen: (_, ws) => {
          broker.subscribeAll(ws);
        },
        onClose: (_, ws) => {
          broker.unsubscribeAll(ws);
        },
      };
    }),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket((c) => {
      const convId = c.req.param("conversationId");
      const customer = c.get("customer");
      const genius = c.get("genius");

      return {
        onOpen: (_, ws) => {
          broker.subscribe(convId, ws);
        },
        onMessage: (event, ws) => {
          broker.publish(convId, event.data, ws);
        },
        onClose: (_, ws) => {
          broker.unsubscribe(convId, ws);
        },
      };
    }),
  );
