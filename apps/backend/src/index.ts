import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { customerAuth, geniusAuth } from "./auth";
import { cors } from "hono/cors";
import { customerAuthBasePath, geniusAuthBasePath } from "@ek/auth";
import { customerRoutes } from "./routes/customerRoutes";
import { chatRoutes, injectWebSocket } from "./routes/chatRoutes";
import { geniusRoutes } from "./routes/geniusRoutes";

const app = new Hono()
  .use(
    cors({
      origin: [env.CUSTOMER_TRUSTED_ORIGIN, env.GENIUS_TRUSTED_ORIGIN],
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  )
  .on(["POST", "GET"], `${customerAuthBasePath}/**`, (c) => {
    return customerAuth.handler(c.req.raw);
  })
  .on(["POST", "GET"], `${geniusAuthBasePath}/**`, (c) => {
    return geniusAuth.handler(c.req.raw);
  })
  .route("/", chatRoutes)
  .route("/", geniusRoutes)
  .route("/", customerRoutes);

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
