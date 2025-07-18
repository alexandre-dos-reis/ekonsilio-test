import type { WSContext } from "hono/ws";

export type WS = WSContext<WebSocket>;

type ConversationId = string;
type UserId = string;

type Conversations = Map<ConversationId, { subscriptions: Map<UserId, WS> }>;

export class PubSubBroker<TPayload extends Record<any, any>> {
  private conversations: Conversations = new Map<
    ConversationId,
    { subscriptions: Map<UserId, WS> }
  >();

  subscribe(convId: string, ws: WS, userId: string) {
    let conversation = this.conversations.get(convId);

    if (!conversation) {
      this.conversations.set(convId, {
        subscriptions: new Map([[userId, ws]]),
      });
    } else {
      conversation.subscriptions.set(userId, ws);
    }
  }

  unsubscribe(conv: string, userId: string) {
    this.conversations.get(conv)?.subscriptions.delete(userId);

    if (this.conversations.get(conv)?.subscriptions.size === 0) {
      this.conversations.delete(conv);
    }
  }

  publish(convId: string, payload: TPayload, wsToExclude?: WS) {
    const conversation = this.conversations.get(convId);
    if (!conversation) return;

    for (const [, socket] of conversation.subscriptions) {
      if (socket === wsToExclude || socket.readyState !== socket.raw?.OPEN) {
        continue;
      }
      socket.send(JSON.stringify(payload));
    }
  }

  getConversation(convId: string) {
    const conversation = this.conversations.get(convId);
    return conversation ?? null;
  }

  getConversations() {
    return Array.from(this.conversations).map(([convId, conversation]) => ({
      ...conversation,
      id: convId,
    }));
  }
}
