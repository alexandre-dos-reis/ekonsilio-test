import { Button } from "@/components/Button";
import { ChatBubble, type Message } from "@/components/ChatBubble";
import { Input } from "@/components/Input";
import { client } from "@/utils/client";
import {
  createFileRoute,
  type RegisteredRouter,
  type RouteById,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/chat/$conversationId")({
  loader: async ({ params: { conversationId } }) => {
    const res = await client.chat[":conversationId"].$get({
      param: { conversationId },
    });
    return res.json();
  },
  component: RouteComponent,
});

function getMessages(
  conversation: RouteById<
    RegisteredRouter["routeTree"],
    "/chat/$conversationId"
  >["types"]["loaderData"],
): Array<Message> {
  if (!conversation) {
    return [];
  }

  const userMessages = conversation.userMessages.map((m) => ({
    ...m,
    user: conversation.user!,
  }));

  const geniusMessages = conversation.geniusMessages.map((m) => ({
    ...m,
    user: conversation.genius!,
  }));

  return [...userMessages, ...geniusMessages].sort(
    (a, b) => b.timestamp - a.timestamp,
  );
}

function RouteComponent() {
  const [messages, setMessages] = useState<Array<Message>>(
    getMessages(Route.useLoaderData()),
  );

  return (
    <>
      <div className="py-5 h-full">
        {messages.map((m) => (
          <ChatBubble
            key={`${m.timestamp}-${m.user.id}-${m.content}`}
            message={m}
          />
        ))}
      </div>
      <Input label="Enter your message" />
      <div className="flex justify-end">
        <Button>Send your message</Button>
      </div>
    </>
  );
}
