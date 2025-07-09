import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/", () => "Hello Elysia")
  .ws("/chat", {
    body: t.Object({ message: t.String() }),
    response: t.Object({ message: t.String() }),
    message: (ws, payload) => {
      console.log(payload.message);
      ws.send({ message: "pong" });
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
