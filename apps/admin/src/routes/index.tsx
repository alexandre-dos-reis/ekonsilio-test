import { ConversationList } from "@/components/ConversationList";
import { client, wsClient } from "@/utils/client";
import { getData } from "@ek/shared";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { useCallback } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/signin",
      });
    }
  },
  loader: async () => {
    const res = await client.conversations.$get();
    return res.json();
  },
  component: RouteComponent,
});

export type Conversations = Array<{
  userName: string;
  conversationId: string;
  createdAt: string;
  content: string;
}>;

function RouteComponent() {
  const [pastConversations, setPastConversations] = useState<Conversations>(
    Route.useLoaderData()
      .pastConversations.map((c) => ({
        content: c.messages.content,
        createdAt: c.messages.createdAt,
        conversationId: c.conversations.id,
        userName: c.users.name,
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );
  const [liveConversations, setLiveConversations] = useState<Conversations>([]);

  const ws = useMemo(() => wsClient.chat.$ws(), []);

  const onMessage = useCallback((event: MessageEvent) => {
    const data = getData(event.data);
    switch (data.event) {
      case "conversations-waiting-for-genius": {
        setLiveConversations(
          data.data.convs.map((c) => ({ ...c, conversationId: c.id })),
        );
      }
    }
  }, []);

  useEffect(() => {
    ws.addEventListener("message", onMessage);
    return () => {
      ws.removeEventListener("message", onMessage);
      ws.close();
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <h2 className="text-center text-xl mb-3">Conversations availables</h2>
        <ConversationList showPulse conversations={liveConversations} />
      </div>
      <div>
        <h2 className="text-center text-xl mb-3">Past Conversations</h2>
        <ConversationList conversations={pastConversations} />
      </div>
    </div>
  );
}
