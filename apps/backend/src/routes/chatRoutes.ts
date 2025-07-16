import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { App } from "..";
import { type User } from "@ek/auth";
import { authMiddleware } from "@/middleware/auth";
import { ConversationService } from "@/services/Conversation";

const chatRoutes = new Hono<App>().basePath("/chat");

const convService = new ConversationService();

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: chatRoutes,
});

const routes = chatRoutes
  .use(authMiddleware)
  .get(
    "/",
    upgradeWebSocket(async () => ({
      onOpen: async (_, ws) => {
        convService.enterGeniusWaitingRoom(ws);
        await convService.sendNewConversationsToGenius();
      },
      onClose: async (_, ws) => {
        convService.leaveGeniusWaitingRoom(ws);
      },
    })),
  )
  .get(
    "/:conversationId",
    upgradeWebSocket(async (c) => {
      const convId = c.req.param("conversationId");
      const user = c.get("user") as NonNullable<User>;

      return {
        onOpen: async (_, ws) => {
          await convService.enterConversation(convId, ws, user);

          await convService.sendNewConversationsToGenius();
        },
        onMessage: async (event, ws) => {
          await convService.speak(event, ws, convId, user);
        },
        onClose: async (_, ws) => {
          convService.leaveConversation(convId, ws, user);
          await convService.sendNewConversationsToGenius();
        },
      };
    }),
  );

export { chatRoutes };

export type ChatRoutes = typeof routes;
