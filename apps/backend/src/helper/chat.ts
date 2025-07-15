import { db } from "@/db";
import { conversations, messages, eq, inArray, users } from "@ek/db";
import { sendData, type SocketMessage } from "@ek/shared";
import type { PubSubBroker, WS } from "./PubSubBroker";

export const sendNewConversationsToGenius = async (
  broker: PubSubBroker<SocketMessage, { status: string }>,
  sendTo?: Array<WS>,
) => {
  const convsWithInitStatus = Array.from(
    broker.getConversations(),
    ([id, value]) => ({ ...value.state, id }),
  )
    .filter((c) => c.status === "init")
    .map((c) => c.id);

  const subquery = db
    .selectDistinctOn([messages.conversationId])
    .from(messages)
    .as("messages");

  const convs = await db
    .select()
    .from(conversations)
    .innerJoin(users, eq(users.id, conversations.createdById))
    .innerJoin(subquery, eq(subquery.conversationId, conversations.id))
    .where(inArray(conversations.id, convsWithInitStatus));

  (sendTo || broker.getGlobalSubscribers()).map((ws) => {
    ws.send(
      sendData({
        event: "conversations-waiting-for-genius",
        data: {
          convs: convs.map((c) => ({
            id: c.conversations.id,
            content: c.messages.content,
            createdAt: c.messages.createdAt,
            userName: c.users.name,
          })),
        },
      }),
    );
  });
};
