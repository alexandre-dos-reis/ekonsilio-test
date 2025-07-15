import { db } from "@/db";
import { conversations, messages, eq, inArray, users } from "@ek/db";
import { type SocketMessage } from "@ek/shared";
import type { PubSubBroker } from "./PubSubBroker";
import { GENIUS_WAITING_ROOM } from "@/routes/chatRoutes";

export const publishNewConversationsToGenius = async (
  broker: PubSubBroker<SocketMessage, { status: string }>,
) => {
  const convsWithInitStatus = broker
    .getConversations()
    .filter((c) => c.state.status === "init")
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

  broker.publish(GENIUS_WAITING_ROOM, {
    event: "conversations-waiting-for-genius",
    data: {
      convs: convs.map((c) => ({
        id: c.conversations.id,
        content: c.messages.content,
        createdAt: c.messages.createdAt,
        userName: c.users.name,
      })),
    },
  });
};
