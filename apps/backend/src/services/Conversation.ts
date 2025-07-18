import { db } from "../db";
import { PubSubBroker, type WS } from "../utils/PubSubBroker";
import type { User } from "@ek/auth";
import { conversations, messages, users, eq, inArray } from "@ek/db";
import type { StatusConv } from "@ek/db/types";
import { getData, type SocketMessage } from "@ek/shared";
import type { WSMessageReceive } from "hono/ws";

export class ConversationService {
  private broker = new PubSubBroker<SocketMessage, { status: string }>();

  private readonly GENIUS_WAITING_ROOM = "GENIUS_WAITING_ROOM";

  public async enterConversation(
    convId: string,
    ws: WS,
    user: NonNullable<User>,
  ) {
    let [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId));

    this.broker.subscribe(
      convId,
      ws,
      user.id,
      conv.status
        ? {
            status: conv.status,
          }
        : undefined,
    );

    this.broker.publish(
      convId,
      {
        event: "join-conversation",
        data: {
          userName: user.name,
          conversationStatus: conv.status ?? undefined,
        },
      },
      ws,
    );
  }

  public async leaveConversation(
    convId: string,
    ws: WS,
    user: NonNullable<User>,
  ) {
    this.broker.publish(
      convId,
      {
        event: "quit-conversation",
        data: { userName: user.name },
      },
      ws,
    );
    this.broker.unsubscribe(convId, user.id);
    await this.sendNewConversationsToGenius();
  }

  public async sendMessage(
    event: MessageEvent<WSMessageReceive>,
    ws: WS,
    convId: string,
    user: NonNullable<User>,
  ) {
    const wsData = getData(event.data.toString());

    if (wsData.event === "message") {
      const data = wsData.data;

      await db.insert(messages).values({
        content: data.content,
        userId: user.id,
        conversationId: convId,
        createdAt: data.createdAt,
      });

      this.broker.publish(convId, wsData, ws);
    }
  }

  public sendOnlineUsers(convId: string) {
    const conv = this.broker.getConversation(convId);
    if (!conv) {
      return;
    }

    const onlineUsersId = Array.from(conv.subscriptions.keys());

    this.broker.publish(convId, {
      event: "users-currently-present-in-the-conversation",
      data: { usersId: onlineUsersId },
    });
  }

  public enterGeniusWaitingRoom(ws: WS, geniusId: string) {
    this.broker.subscribe(this.GENIUS_WAITING_ROOM, ws, geniusId);
  }

  public leaveGeniusWaitingRoom(geniusId: string) {
    this.broker.unsubscribe(this.GENIUS_WAITING_ROOM, geniusId);
  }

  public async updateConversationStatus(convId: string, status: StatusConv) {
    this.broker.setConversationState(convId, { status });
    await this.sendNewConversationsToGenius();
  }

  public async sendNewConversationsToGenius() {
    const convsWithInitStatus = this.broker
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

    this.broker.publish(this.GENIUS_WAITING_ROOM, {
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
  }
}
