import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { users, conversations } from "@ek/db";
import { eq } from "drizzle-orm";
import z from "zod";
import type { App } from "@/types";
import { Hono } from "hono";

export const customerRoutes = new Hono<App>()
  .basePath("/customers")
  .get("/chat", async (c) => {
    const customer = c.get("customer");

    if (!customer) {
      return c.json({ error: "Customer must be authenticated !" });
    }

    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.customerId, customer.id));

    return c.json(convs);
  })
  .post(
    "/chat/new",
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

      const { messageContent, messageTimestamp } = c.req.valid("json");

      const [conv] = await db
        .insert(conversations)
        .values({
          customerId: customer.id,
          status: "init",
          customerMessages: [
            { content: messageContent, timestamp: messageTimestamp },
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

    const [[customer], [genius]] = await Promise.all([
      conv.customerId
        ? db.select().from(users).where(eq(users.id, conv.customerId))
        : [null],
      conv.geniusId
        ? await db.select().from(users).where(eq(users.id, conv.geniusId))
        : [null],
    ]);

    return c.json({
      ...conv,
      customer,
      genius,
    });
  });
