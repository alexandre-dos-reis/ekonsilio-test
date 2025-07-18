import { db } from "../db";
import { conversations, eq, messages, users } from "@ek/db";
import { Hono } from "hono";
import { conversationCols, messageCols } from "./customerRoutes";
import type { App } from "..";
import { auth } from "../auth";
import { convService } from "./chatRoutes";

export const geniusRoutes = new Hono<App>()
  .basePath("/genius")
  .use(async (c, next) => {
    const user = c.get("user");

    if (!user || user?.role !== "genius") {
      auth.api.signOut({ headers: c.req.raw.headers });
      return c.json(null, 403);
    }

    return next();
  })
  .get("/conversations", async (c) => {
    const genius = c.get("user");

    const pastConversations = await db
      .selectDistinctOn([messages.conversationId])
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(users, eq(users.id, conversations.createdById))
      .where(eq(conversations.managedById, genius.id));

    return c.json({ pastConversations });
  })
  .get("/conversations/:id", async (c) => {
    const convId = c.req.param("id");
    const genius = c.get("user");

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
      conv = (
        await db
          .update(conversations)
          .set({
            status: "active",
          })
          .where(eq(conversations.id, convId))
          .returning(conversationCols)
      ).at(0)!;

      await convService.sendNewConversationsToGenius();
    }

    if (!conv.managedById) {
      conv = (
        await db
          .update(conversations)
          .set({
            managedById: genius.id,
          })
          .where(eq(conversations.id, convId))
          .returning(conversationCols)
      ).at(0)!;
    }

    return c.json({ ...conv, messages: msgs });
  });

export type GeniusRoutes = typeof geniusRoutes;
