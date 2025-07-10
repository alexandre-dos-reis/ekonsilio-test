import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { db } from "./db";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [env.APP_USER_TRUSTED_ORIGIN, env.APP_GENIUS_TRUSTED_ORIGIN],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

const authUserPath = "/api/auth/user";
const authGeniusPath = "/api/auth/genius";

app
  .on(["POST", "GET"], `${authUserPath}/**`, (c) => {
    return auth({
      role: "user",
      basePath: authUserPath,
      trustedOrigin: env.APP_USER_TRUSTED_ORIGIN,
    }).handler(c.req.raw);
  })
  .on(["POST", "GET"], ` ${authGeniusPath}/**`, (c) => {
    return auth({
      role: "genius",
      basePath: authGeniusPath,
      trustedOrigin: env.APP_GENIUS_TRUSTED_ORIGIN,
    }).handler(c.req.raw);
  })
  .get("/", async (c) => {
    const result = await db.execute("select 1");
    console.log(result.rows);
    return c.text("ok");
  });

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

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
