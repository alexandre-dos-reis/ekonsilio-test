import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env";
import { db } from "./db";

const app = new Hono();

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
