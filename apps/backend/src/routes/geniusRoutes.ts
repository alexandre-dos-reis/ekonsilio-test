import { geniusAuth } from "@/auth";
import { db } from "@/db";
import type { App } from "@/types";
import { conversations, eq, messages } from "@ek/db";
import { Hono } from "hono";

export const geniusRoutes = new Hono<App>()
  .basePath("/genius")
  .use(async (c, next) => {
    const geniusSession = await geniusAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    // if (!geniusSession) {
    //   return c.json({ error: "Unauthorized" }, 403);
    // }

    c.set("genius", geniusSession?.user || null);

    return next();
  })
  .get("/conversations", async (c) => {
    const genius = c.get("genius")!;

    const [conversationsWaitingForGenius, pastConversations] =
      await Promise.all([
        db.select().from(conversations).where(eq(conversations.status, "init")),
        db
          .selectDistinctOn([messages.conversationId])
          .from(messages)
          .where(eq(messages.userId, genius.id)),
      ]);

    return c.json({ conversationsWaitingForGenius, pastConversations });
  });

export type GeniusRoutes = typeof geniusRoutes;
