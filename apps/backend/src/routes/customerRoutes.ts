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
import { customerAuth } from "@/auth";

const conversationCols = (() => {
  const { id, status, createdAt } = getTableColumns(conversations);
  return { id, status, createdAt };
})();

const messageCols = (() => {
  const { id, userId, content, createdAt } = getTableColumns(messages);
  return { id, userId, content, createdAt };
})();

export const customerRoutes = new Hono<{
  Variables: {
    customer: (typeof customerAuth)["$Infer"]["Session"]["user"];
  };
}>()
  .basePath("/customers")
  .use(async (c, next) => {
    const customerSession = await customerAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!customerSession) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    c.set("customer", customerSession.user);

    return next();
  })
  .get("/conversations", async (c) => {
    const customer = c.get("customer");

    if (!customer) {
      return c.json({ error: "Customer must be authenticated !" });
    }

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
  .get("/conversations/:id", async (c) => {
    const convId = c.req.param("id");
    const customer = c.get("customer");

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

    const res = { ...conv, messages: msgs };

    return c.json(res);
  });

export type CustomerRoutes = typeof customerRoutes;
