import { geniusAuth } from "@/auth";
import { db } from "../db";
import { conversations, eq, messages, and } from "@ek/db";
import { Hono } from "hono";

export const geniusRoutes = new Hono<{
  Variables: {
    genius: (typeof geniusAuth)["$Infer"]["Session"]["user"];
  };
}>()
  .basePath("/genius")
  .use(async (c, next) => {
    const geniusSession = await geniusAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!geniusSession) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    c.set("genius", geniusSession.user);

    return next();
  })
  .get("/conversations", async (c) => {
    const genius = c.get("genius");

    const pastConversations = await db
      .selectDistinctOn([messages.conversationId])
      .from(messages)
      .where(eq(messages.userId, genius.id));

    return c.json({ pastConversations });
  });

export type GeniusRoutes = typeof geniusRoutes;
