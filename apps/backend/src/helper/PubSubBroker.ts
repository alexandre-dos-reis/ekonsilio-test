import type { conversations } from "@ek/db";
import type { WSContext } from "hono/ws";

export interface ConversationState {
  status: (typeof conversations)["$inferSelect"]["status"];
}

type WS = WSContext<WebSocket>;

interface Conversation {
  subscriptions: Set<WS>;
  state: ConversationState;
}

export type GlobalForwardFilter = (
  topic: string,
  state: ConversationState,
  subs: Set<WS>,
) => boolean;

export class PubSubBroker<T> {
  /**
   * Store in a Map a conversationId => Conversation
   * Multiple participant to a conversation
   * */
  private conversations = new Map<string, Conversation>();
  /**
   * Store global subscribers
   * */
  private globalSubscriptions = new Set<WS>(); // sockets that hear ALL rooms

  constructor(
    private shouldForwardGlobally: GlobalForwardFilter = () => true,
  ) {}

  subscribe(conv: string, ws: WS) {
    if (this.globalSubscriptions.has(ws)) {
      throw new Error("Socket is a global subscriber and cannot join rooms");
    }
    let t = this.conversations.get(conv);
    t?.subscriptions.add(ws);
  }

  unsubscribe(conv: string, ws: WS) {
    this.conversations.get(conv)?.subscriptions.delete(ws);
    if (this.conversations.get(conv)?.subscriptions.size === 0) {
      this.conversations.delete(conv);
    }
  }

  subscribeAll(ws: WS) {
    for (const [, t] of this.conversations) {
      if (t.subscriptions.has(ws)) {
        throw new Error("Socket is already in a room and cannot become global");
      }
    }
    this.globalSubscriptions.add(ws);
  }

  unsubscribeAll(ws: WS) {
    this.globalSubscriptions.delete(ws);
  }

  remove(ws: WS) {
    for (const [, t] of this.conversations) {
      t.subscriptions.delete(ws);
    }
    for (const [name, t] of this.conversations)
      if (t.subscriptions.size === 0) {
        this.conversations.delete(name);
      }
    this.globalSubscriptions.delete(ws);
  }

  private fanOut(targets: Set<WS>, data: string | Buffer, sender: WS) {
    for (const sock of targets) {
      if (sock === sender || sock.readyState !== sock.raw?.OPEN) {
        continue;
      }
      sock.send(data);
    }
  }

  publish(conv: string, data: string | Buffer, sender: WS) {
    const t = this.conversations.get(conv);
    if (!t) return;

    // (1) send to the conversation
    this.fanOut(t.subscriptions, data, sender);

    // (2) send to global listeners
    if (this.shouldForwardGlobally(conv, t.state, t.subscriptions)) {
      this.fanOut(this.globalSubscriptions, data, sender);
    }
  }

  getConversationState(conv: string) {
    return this.conversations.get(conv)?.state;
  }

  setConversationState(
    conv: string,
    patch:
      | Partial<ConversationState>
      | ((s: ConversationState) => ConversationState),
  ) {
    const t = this.conversations.get(conv);
    if (!t) return;
    t.state =
      typeof patch === "function"
        ? patch({ ...t.state })
        : { ...t.state, ...patch };
  }
}
