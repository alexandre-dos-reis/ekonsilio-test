import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { App } from "..";
import { type User } from "@ek/auth";
import { authMiddleware } from "../middlewares/auth";
import { ConversationService } from "../services/Conversation";

const chatRoutes = new Hono<App>().basePath("/chat");

export const convService = new ConversationService();

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: chatRoutes,
});

const routes = chatRoutes
  .use(authMiddleware)
  .use(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(null, 403);
    }

    return next();
  })
  .get(
    "/",
    upgradeWebSocket(async (c) => {
      const user = c.get("user") as NonNullable<User>;

      if (user.role !== "genius") {
        return {
          onOpen: async (_, ws) => {
            ws.close(403);
          },
        };
      }

      return {
        onOpen: async (_, ws) => {
          convService.enterGeniusWaitingRoom(ws, user.id);
          await convService.sendNewConversationsToGenius();
        },
        onClose: async () => {
          convService.leaveGeniusWaitingRoom(user.id);
        },
      };
    }),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket(async (c) => {
      const convId = c.req.param("conversationId");
      const user = c.get("user") as NonNullable<User>;

      return {
        onOpen: async (_, ws) => {
          await convService.enterConversation(convId, ws, user);
          convService.sendOnlineUsers(convId);
          await convService.sendNewConversationsToGenius();
        },
        onMessage: async (event, ws) => {
          await convService.sendMessage(event, ws, convId, user);
        },
        onClose: async (_, ws) => {
          convService.leaveConversation(convId, ws, user);
          convService.sendOnlineUsers(convId);
        },
      };
    }),
  );

export { chatRoutes };

export type ChatRoutes = typeof routes;
