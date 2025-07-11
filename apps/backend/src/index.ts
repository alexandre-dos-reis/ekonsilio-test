import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { env } from "./env";
import { db } from "./db";
import { userAuth, geniusAuth } from "./auth";
import { cors } from "hono/cors";
import { abstractUsers, conversations } from "./db/schema";

import { eq } from "drizzle-orm";
import z from "zod";

const app = new Hono<{
  Variables: {
    user: (typeof userAuth)["$Infer"]["Session"]["user"] | null;
    genius: (typeof geniusAuth)["$Infer"]["Session"]["user"] | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: [env.APP_USER_TRUSTED_ORIGIN, env.APP_GENIUS_TRUSTED_ORIGIN],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use("*", async (c, next) => {
  const [userSession, geniusSession] = await Promise.all([
    userAuth.api.getSession({ headers: c.req.raw.headers }),
    geniusAuth.api.getSession({ headers: c.req.raw.headers }),
  ]);

  c.set("user", userSession ? userSession.user : null);
  c.set("genius", geniusSession ? geniusSession.user : null);

  return next();
});

// TODO: Move auth to its own packages
const authUserPath = "/api/auth/user";
const authGeniusPath = "/api/auth/genius";

app
  .on(["POST", "GET"], `${authUserPath}/**`, (c) => {
    return userAuth.handler(c.req.raw);
  })
  .on(["POST", "GET"], ` ${authGeniusPath}/**`, (c) => {
    return geniusAuth.handler(c.req.raw);
  });

const rpc = app
  .get("/chat", async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "User must be authenticated !" });
    }

    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id));

    return c.json(convs);
  })
  .post(
    "/chat/new",
    zValidator(
      "json",
      z.object({
        messageContent: z.string().nonempty(),
        messageCreatedAt: z.number(),
      }),
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "User must be authenticated !" });
      }

      const { messageContent, messageCreatedAt } = c.req.valid("json");

      const [conv] = await db
        .insert(conversations)
        .values({
          userId: user.id,
          status: "init",
          userMessages: [
            { content: messageContent, timestamp: messageCreatedAt },
          ],
        })
        .returning();

      return c.json(conv);
    },
  )
  .get("/chat/:conversationId", async (c) => {
    const convId = c.req.param("conversationId");

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId));

    if (!conv) {
      return c.json(null);
    }

    const [[user], [geniusUser]] = await Promise.all([
      conv.userId
        ? db
            .select()
            .from(abstractUsers)
            .where(eq(abstractUsers.id, conv.userId))
        : [null],
      true
        ? await db
            .select()
            .from(abstractUsers)
            .where(eq(abstractUsers.id, "2a410152-a650-4c29-a16b-8dabd3dea49d"))
        : [null],
    ]);

    return c.json({
      ...conv,
      user,
      genius: geniusUser,
    });
  })
  .get("/", async (c) => {
    const result = await db.execute("select 1");
    console.log(result.rows);
    return c.text("ok");
  });

export type Rpc = typeof rpc;

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
