import type { WSContext } from "hono/ws";

export type WS = WSContext<WebSocket>;

type Conversations<TState extends Record<any, any>> = Map<
  string,
  { subscriptions: Set<WS>; state: TState }
>;

export class PubSubBroker<
  TPayload extends Record<any, any>,
  TState extends Record<any, any>,
> {
  private conversations: Conversations<TState> = new Map<
    string, //conversationId
    { subscriptions: Set<WS>; state: TState }
  >();

  subscribe(convId: string, ws: WS, initState?: TState) {
    let conversation = this.conversations.get(convId);

    if (!conversation) {
      this.conversations.set(convId, {
        subscriptions: new Set([ws]),
        state: initState || ({} as TState),
      });
    } else {
      conversation.subscriptions.add(ws);
    }
  }

  unsubscribe(conv: string, ws: WS) {
    this.conversations.get(conv)?.subscriptions.delete(ws);

    if (this.conversations.get(conv)?.subscriptions.size === 0) {
      this.conversations.delete(conv);
    }
  }

  publish(convId: string, payload: TPayload, sender?: WS) {
    const conversation = this.conversations.get(convId);
    if (!conversation) return;

    for (const socket of conversation.subscriptions) {
      if (socket === sender || socket.readyState !== socket.raw?.OPEN) {
        continue;
      }
      socket.send(JSON.stringify(payload));
    }
  }

  getConversations() {
    return Array.from(this.conversations).map(([convId, conversation]) => ({
      ...conversation,
      id: convId,
    }));
  }

  setConversationState(convId: string, newState: TState) {
    const conversation = this.conversations.get(convId);
    if (!conversation) return;
    conversation.state = newState;
  }
}
