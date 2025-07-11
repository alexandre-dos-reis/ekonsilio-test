import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { client } from "@/utils/client";
import { getRelativeTime } from "@/utils/func";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await client.chat.$get();
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
            const res = await client.chat.new.$post({
              json: {
                messageContent: firstMessage,
                messageCreatedAt: Date.now(),
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
          .sort(
            (a, b) =>
              (b.userMessages[0]?.timestamp || 0) -
              (a.userMessages[0]?.timestamp || 0),
          )
          .map((c) => {
            const firstMessage = c.userMessages.at(0);
            return (
              <li>
                <Link
                  to="/chat/$conversationId"
                  params={{ conversationId: c.id }}
                  className="list-row bg-base-300 p-2 flex justify-between"
                >
                  <div>{firstMessage?.content}</div>
                  <div>{getRelativeTime(firstMessage?.timestamp || 0)}</div>
                </Link>
              </li>
            );
          })}
      </ul>
    </>
  );
}
