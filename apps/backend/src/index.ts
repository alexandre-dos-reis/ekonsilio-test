import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { customerRoutes } from "./routes/customerRoutes";
import { chatRoutes, injectWebSocket } from "./routes/chatRoutes";
import { geniusRoutes } from "./routes/geniusRoutes";
import { authMiddleware } from "./middlewares/auth";
import { authBasePath } from "@ek/shared";

export type App = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session | null;
  };
};

const app = new Hono<App>()
  .use(
    "*",
    cors({
      origin: [env.CUSTOMER_TRUSTED_ORIGIN, env.GENIUS_TRUSTED_ORIGIN],
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  )
  .use(authMiddleware)
  .on(["POST", "GET"], `${authBasePath}/**`, (c) => {
    return auth.handler(c.req.raw);
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
