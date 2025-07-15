import { geniusAuth } from "@/auth";
import { db } from "../db";
import { conversations, eq, messages, and, users } from "@ek/db";
import { Hono } from "hono";
import { conversationCols, messageCols } from "./customerRoutes";

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
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(users, eq(users.id, conversations.createdById))
      .where(eq(messages.userId, genius.id));

    return c.json({ pastConversations });
  })
  .get("/conversations/:id", async (c) => {
    const convId = c.req.param("id");

    let [[conv], msgs] = await Promise.all([
      db
        .select(conversationCols)
        .from(conversations)
        .where(eq(conversations.id, convId)),
      db
        .select({
          ...messageCols,
          userId: users.id,
          name: users.name,
          role: users.role,
        })
        .from(messages)
        .innerJoin(users, eq(users.id, messages.userId))
        .where(eq(messages.conversationId, convId))
        .orderBy(messages.createdAt),
    ]);

    if (!conv) {
      return c.json(null);
    }

    if (conv.status === "init") {
      await db.update(conversations).set({ status: "active" });
      conv.status = "active";
    }

    return c.json({ ...conv, messages: msgs });
  });

export type GeniusRoutes = typeof geniusRoutes;
