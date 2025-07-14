import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import {
  conversations,
  messages,
  eq,
  getTableColumns,
  desc,
  users,
} from "@ek/db";
import z from "zod";
import type { App } from "@/types";
import { Hono } from "hono";

const conversationCols = (() => {
  const { id, status, createdAt } = getTableColumns(conversations);
  return { id, status, createdAt };
})();

const messageCols = (() => {
  const { id, userId, content, createdAt } = getTableColumns(messages);
  return { id, userId, content, createdAt };
})();

export const customerRoutes = new Hono<App>()
  .basePath("/customers")
  .get("/conversations", async (c) => {
    const customer = c.get("customer");

    if (!customer) {
      return c.json({ error: "Customer must be authenticated !" });
    }

    try {
      const subquery = db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .as("firstMessage");

      const convs = await db
        .select({
          ...conversationCols,
          firstMessage: {
            id: subquery.id,
            content: subquery.content,
            createdAt: subquery.createdAt,
          },
        })
        .from(conversations)
        .innerJoin(subquery, eq(subquery.conversationId, conversations.id))
        .where(eq(conversations.createdById, customer.id));

      return c.json(convs);
    } catch (e) {
      return c.json({ error: "error" });
    }
  })
  .post(
    "/conversations/new",
    zValidator(
      "json",
      z.object({
        messageContent: z.string().nonempty(),
        messageTimestamp: z.number(),
      }),
    ),
    async (c) => {
      const customer = c.get("customer");

      if (!customer) {
        return c.json({ error: "User must be authenticated !" });
      }

      const { messageContent } = c.req.valid("json");

      const [conv] = await db
        .insert(conversations)
        .values({
          createdById: customer.id,
          status: "init",
        })
        .returning(conversationCols);

      const [msg] = await db
        .insert(messages)
        .values({
          conversationId: conv.id,
          content: messageContent,
          userId: customer.id,
        })
        .returning(messageCols);

      return c.json({ ...conv, message: msg });
    },
  )
  .get("/conversations/:conversationId", async (c) => {
    const convId = c.req.param("conversationId");

    const [[conv], msgs] = await Promise.all([
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

    const res = { ...conv, messages: msgs };

    return c.json(res);
  });

export type CustomerRoutes = typeof customerRoutes;
