import { client, wsClient } from "@/utils/client";
import { getData } from "@ek/shared";

import { getRelativeTime } from "@ek/ui";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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

function RouteComponent() {
  const { pastConversations } = Route.useLoaderData();

  const [liveConversations, setLiveConversations] = useState<
    Array<{
      userName: string;
      conversationId: string;
      createdAt: string;
      content: string;
    }>
  >([]);

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
        {liveConversations.length === 0 ? (
          <div className="italic text-center">None available.</div>
        ) : (
          <ul className="list gap-2">
            {liveConversations.map((c) => (
              <Link
                key={c.conversationId}
                to="/chat/$conversationId"
                params={{ conversationId: c.conversationId }}
                className="list-row bg-base-300 relative"
              >
                <div>
                  <div>
                    <span className="font-bold">{c.content}</span>
                  </div>
                  <div>
                    by <span className="italic">{c.userName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">
                      {getRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <span className="absolute -top-5 right-0 flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                  </span>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-center text-xl mb-3">Past Conversations</h2>
        <ul className="list gap-2">
          <li className="list-row bg-base-300">ok</li>
          <li className="list-row bg-base-300">ok</li>
          <li className="list-row bg-base-300">ok</li>
        </ul>
      </div>
    </div>
  );
}
