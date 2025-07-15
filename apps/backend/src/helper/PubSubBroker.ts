import type { WSContext } from "hono/ws";

export type WS = WSContext<WebSocket>;

// export type GlobalForwardFilter = (topic: string, subs: Set<WS>) => boolean;

type Conversations<TState extends Record<any, any>> = Map<
  string,
  { subscriptions: Set<WS>; state: TState }
>;

export class PubSubBroker<
  TPayload extends Record<any, any>,
  TState extends Record<any, any>,
> {
  /**
   * Store in a Map a conversationId => Set of websockets
   * Multiple participant to a conversation
   * */
  private conversations: Conversations<TState> = new Map<
    string,
    { subscriptions: Set<WS>; state: TState }
  >();
  /**
   * Store global subscribers
   * */
  private globalSubscriptions = new Set<WS>(); // sockets that hear ALL rooms

  // constructor(
  //   private shouldForwardGlobally: GlobalForwardFilter = () => true,
  // ) {}

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

  subscribeAll(ws: WS) {
    this.globalSubscriptions.add(ws);
  }

  unsubscribeAll(ws: WS) {
    this.globalSubscriptions.delete(ws);
  }

  private send(targets: Set<WS>, payload: TPayload, sender: WS) {
    for (const sock of targets) {
      if (sock === sender || sock.readyState !== sock.raw?.OPEN) {
        continue;
      }
      sock.send(JSON.stringify(payload));
    }
  }

  publish(convId: string, payload: TPayload, sender: WS) {
    const conversation = this.conversations.get(convId);
    if (!conversation) return;

    // Send to the conversation
    this.send(conversation.subscriptions, payload, sender);

    // // Send Globally it filters returns true
    // if (this.shouldForwardGlobally(convId, conversation.subscriptions)) {
    //   this.send(this.globalSubscriptions, payload, sender);
    // }
  }

  getConversations() {
    return this.conversations;
  }

  getGlobalSubscribers() {
    return Array.from(this.globalSubscriptions);
  }
}
