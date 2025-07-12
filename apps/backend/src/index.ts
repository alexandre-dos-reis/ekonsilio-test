import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { env } from "./env";
import { db } from "./db";
import { customerAuth, geniusAuth } from "./auth";
import { cors } from "hono/cors";
import { users, conversations } from "@ek/db";
import { createNodeWebSocket } from "@hono/node-ws";

import { eq } from "drizzle-orm";
import z from "zod";
import { customerAuthBasePath, geniusAuthBasePath } from "@ek/auth";

const app = new Hono<{
  Variables: {
    customer: (typeof customerAuth)["$Infer"]["Session"]["user"] | null;
    genius: (typeof geniusAuth)["$Infer"]["Session"]["user"] | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: [env.APP_CUSTOMER_TRUSTED_ORIGIN, env.APP_GENIUS_TRUSTED_ORIGIN],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use("*", async (c, next) => {
  const [customerSession, geniusSession] = await Promise.all([
    customerAuth.api.getSession({ headers: c.req.raw.headers }),
    geniusAuth.api.getSession({ headers: c.req.raw.headers }),
  ]);

  c.set("customer", customerSession ? customerSession.user : null);
  c.set("genius", geniusSession ? geniusSession.user : null);

  return next();
});

app
  .on(["POST", "GET"], `${customerAuthBasePath}/**`, (c) => {
    return customerAuth.handler(c.req.raw);
  })
  .on(["POST", "GET"], ` ${geniusAuthBasePath}/**`, (c) => {
    return geniusAuth.handler(c.req.raw);
  });

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const usersOnline: Record<
  string, // conversationId
  string // userId
> = {};

const rpc = app
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
  })
  .get(
    "/chat/:conversationId/ws",
    upgradeWebSocket((c) => {
      const convId = c.req.param("conversationId");
      const user = c.get("user");

      return {
        onOpen: (event, ws) => {
          console.log(
            `user ${user.name} is connected to conversation ${convId}`,
          );
          usersOnline[convId] = user.id;
        },
        onMessage: (event, ws) => {
          console.log(`Message from client: ${event.data}`);
          ws.send("Hello from server!");
        },
        onClose: (event, ws) => {
          console.log(`user ${user.name} has left conversation ${convId}`);
          delete usersOnline[convId];
        },
        onError: (event, ws) => {
          console.log("WS Error");
        },
      };
    }),
  )
  .get("/usersOnline", (c) => {
    return c.json(usersOnline);
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

injectWebSocket(server);

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
