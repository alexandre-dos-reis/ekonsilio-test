import type { conversations } from "@ek/db";
import type { WSContext } from "hono/ws";

export interface ConversationState {
  status: (typeof conversations)["$inferSelect"]["status"];
}

type WS = WSContext<WebSocket>;

export type GlobalForwardFilter = (topic: string, subs: Set<WS>) => boolean;

export class PubSubBroker<TData extends Record<any, any>> {
  /**
   * Store in a Map a conversationId => Set of websockets
   * Multiple participant to a conversation
   * */
  private conversations = new Map<string, Set<WS>>();
  /**
   * Store global subscribers
   * */
  private globalSubscriptions = new Set<WS>(); // sockets that hear ALL rooms

  constructor(
    private shouldForwardGlobally: GlobalForwardFilter = () => true,
  ) {}

  subscribe(convId: string, ws: WS) {
    let conversation = this.conversations.get(convId);

    if (!conversation) {
      this.conversations.set(convId, new Set([ws]));
    } else {
      conversation.add(ws);
    }
  }

  unsubscribe(conv: string, ws: WS) {
    this.conversations.get(conv)?.delete(ws);
    if (this.conversations.get(conv)?.size === 0) {
      this.conversations.delete(conv);
    }
  }

  subscribeAll(ws: WS) {
    this.globalSubscriptions.add(ws);
  }

  unsubscribeAll(ws: WS) {
    this.globalSubscriptions.delete(ws);
  }

  private send(targets: Set<WS>, data: TData, sender: WS) {
    for (const sock of targets) {
      if (sock === sender || sock.readyState !== sock.raw?.OPEN) {
        continue;
      }
      sock.send(JSON.stringify(data));
    }
  }

  publish(convId: string, data: TData, sender: WS) {
    const conversation = this.conversations.get(convId);
    if (!conversation) return;

    // Send to the conversation
    this.send(conversation, data, sender);

    // Send Globally it filters returns true
    if (this.shouldForwardGlobally(convId, conversation)) {
      this.send(this.globalSubscriptions, data, sender);
    }
  }
}
