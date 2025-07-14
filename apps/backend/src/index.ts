import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { customerAuth, geniusAuth } from "./auth";
import { cors } from "hono/cors";

import { createNodeWebSocket } from "@hono/node-ws";

import { customerAuthBasePath, geniusAuthBasePath } from "@ek/auth";
import type { App } from "./types";
import { customerRoutes } from "./routes/customerRoutes";
import { geniusRoutes } from "./routes/geniusRoutes";
import { PubSubBroker } from "./helper/PubSubBroker";
import { getData, type SocketMessage } from "@ek/shared";
import { db } from "./db";
import { messages } from "@ek/db";

const app = new Hono<App>();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

const broker = new PubSubBroker<SocketMessage>();

const routes = app
  .use(
    "*",
    cors({
      origin: [env.CUSTOMER_TRUSTED_ORIGIN, env.GENIUS_TRUSTED_ORIGIN],
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .use("*", async (c, next) => {
    const [customerSession, geniusSession] = await Promise.all([
      customerAuth.api.getSession({ headers: c.req.raw.headers }),
      geniusAuth.api.getSession({ headers: c.req.raw.headers }),
    ]);

    c.set("customer", customerSession ? customerSession.user : null);
    c.set("genius", geniusSession ? geniusSession.user : null);

    return next();
  })
  .on(["POST", "GET"], `${customerAuthBasePath}/**`, (c) => {
    return customerAuth.handler(c.req.raw);
  })
  .on(["POST", "GET"], `${geniusAuthBasePath}/**`, (c) => {
    return geniusAuth.handler(c.req.raw);
  })
  .route("/", geniusRoutes)
  .route("/", customerRoutes)
  .get(
    "chat/:conversationId",
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
              const customer = c.get("customer");

              await db.insert(messages).values({
                content: data.content,
                userId: customer.id,
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

export type Routes = typeof routes;

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

injectWebSocket(server);

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
