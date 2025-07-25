import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import {
  conversations,
  messages,
  eq,
  getTableColumns,
  users,
  and,
} from "@ek/db";
import z from "zod";
import { Hono } from "hono";
import type { App } from "..";
import { roleMiddleware } from "../middlewares/role";

export const conversationCols = (() => {
  const { id, status, createdAt, managedById } = getTableColumns(conversations);
  return { id, status, createdAt, managedById };
})();

export const messageCols = (() => {
  const { id, userId, content, createdAt } = getTableColumns(messages);
  return { id, userId, content, createdAt };
})();

export const customerRoutes = new Hono<App>()
  .basePath("/customers")
  .use(roleMiddleware("customer"))
  .get("/conversations", async (c) => {
    const customer = c.get("user");

    try {
      const convs = await db
        .selectDistinctOn([messages.conversationId])
        .from(messages)
        .where(eq(messages.userId, customer.id));

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
      }),
    ),
    async (c) => {
      const customer = c.get("user");

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
  .get("/conversations/:id", async (c) => {
    const convId = c.req.param("id");
    const customer = c.get("user");

    const [[conv], msgs] = await Promise.all([
      db
        .select(conversationCols)
        .from(conversations)
        .where(
          and(
            eq(conversations.id, convId),
            eq(conversations.createdById, customer.id),
          ),
        ),
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

    return c.json({ ...conv, messages: msgs });
  });

export type CustomerRoutes = typeof customerRoutes;
