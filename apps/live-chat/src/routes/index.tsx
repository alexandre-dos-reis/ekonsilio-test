import { client } from "@/utils/client";
import { Button, Input, getRelativeTime } from "@ek/ui";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";

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
  const pastConversations = Route.useLoaderData();
  const nav = useNavigate();
  const [firstMessage, setFirstMessage] = useState("");

  if ("error" in pastConversations) {
    return <div>{pastConversations.error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Start a new conversation</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (firstMessage) {
            const res = await client.conversations.new.$post({
              json: {
                messageContent: firstMessage,
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
        <Input
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
        />
        <Button>Send your first message</Button>
      </form>
      <h2 className="text-2xl font-bold pb-5 py-10">Your past conversations</h2>
      <ul className="grid grid-cols-2 gap-2">
        {pastConversations.length === 0 ? (
          <div className="col-span-2 italic text-center text-sm text-neutral-500">
            None at the moment.
          </div>
        ) : (
          pastConversations
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((c) => {
              return (
                <li key={c.id}>
                  <Link
                    to="/chat/$conversationId"
                    params={{ conversationId: c.conversationId }}
                    className="bg-base-300 flex justify-between items-center px-2 py-1"
                  >
                    <div>{c.content}</div>
                    <div className="text-xs text-neutral-500">
                      {getRelativeTime(c.createdAt)}
                    </div>
                  </Link>
                </li>
              );
            })
        )}
      </ul>
    </div>
  );
}
