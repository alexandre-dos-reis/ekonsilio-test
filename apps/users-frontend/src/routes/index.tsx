import { client } from "@/utils/client";
import { Button, Input, getRelativeTime } from "@ek/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await client.conversations.$get();
    return res.json();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const pastConversations = Route.useLoaderData();
  const nav = useNavigate();
  const [firstMessage, setFirstMessage] = useState("");

  if ("error" in pastConversations) {
    return <div>{pastConversations.error}</div>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Start a new conversation</h2>
      <Input
        value={firstMessage}
        onChange={(e) => setFirstMessage(e.target.value)}
      />
      <Button
        onClick={async () => {
          if (firstMessage) {
            const res = await client.conversations.new.$post({
              json: {
                messageContent: firstMessage,
                messageTimestamp: Date.now(),
              },
            });

            if (res.ok) {
              const conv = await res.json();

              if ("error" in conv) {
                toast(conv.error);
              } else {
                nav({
                  to: "/chat/$conversationId",
                  params: { conversationId: conv.id },
                });
              }
            }
          }
        }}
      >
        Send your first message
      </Button>
      <h2 className="text-2xl font-bold pb-5 py-10">Your past conversations</h2>
      <ul className="flex flex-gap flex-wrap gap-3 list">
        {pastConversations
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((c) => {
            return (
              <li key={c.id}>
                <Link
                  to="/chat/$conversationId"
                  params={{ conversationId: c.id }}
                  className="list-row bg-base-300 p-2 flex justify-between"
                >
                  <div>{c.firstMessage.content}</div>
                  <div>{getRelativeTime(c.firstMessage.createdAt)}</div>
                </Link>
              </li>
            );
          })}
      </ul>
    </>
  );
}
