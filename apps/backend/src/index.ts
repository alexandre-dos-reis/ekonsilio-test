import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { db } from "./db";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*", // or replace with "*" to enable cors for all routes
  cors({
    origin: "http://localhost:5173", // ← specific origin!
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.on(["POST", "GET"], "/api/auth/user/**", (c) => {
  return auth("user").handler(c.req.raw);
});

app.on(["POST", "GET"], "/api/auth/genius/**", (c) => {
  return auth("genius").handler(c.req.raw);
});

app.get("/", async (c) => {
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
