import { Alert, Button, ChatBubble, Input, type Message } from "@ek/ui";
import { client, wsClient } from "@/utils/client";
import {
  createFileRoute,
  type RegisteredRouter,
  type RouteById,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { SocketMessage } from "@ek/types";

export const Route = createFileRoute("/chat/$conversationId")({
  loader: async ({ params: { conversationId } }) => {
    const res = await client.conversations[":conversationId"].$get({
      param: { conversationId },
    });
    return res.json();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const conversation = Route.useLoaderData();
  const { conversationId } = Route.useParams();

  const [status, setStatus] = useState<
    NonNullable<typeof conversation>["status"]
  >(conversation?.status || "init");

  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState("");

  const onMessage = useCallback((event: MessageEvent) => {
    const message = event.data as SocketMessage;
    console.log(message);
    // switch (message.event) {
    //   case "message":
    //     console.log(message.data.content, message.data.timestamp);
    //     break;
    //   case "join-conversation":
    //     console.log(message.data.userName);
    //     break;
    //   case "quit-conversation":
    //     console.log(message.data.userName);
    //     break;
    // }
  }, []);

  useEffect(() => {
    const ws = wsClient.chat[":conversationId"].$ws({
      param: { conversationId },
    });

    ws.addEventListener("message", onMessage);

    return () => {
      ws.removeEventListener("message", onMessage);
      ws.close();
    };
  }, []);

  return (
    <>
      {status === "init" && (
        <Alert type="warning">
          Please wait for a genius to join your conversation...
        </Alert>
      )}
      {status === "inactive" && (
        <Alert type="error">
          This conversation is closed, please open a new one.
        </Alert>
      )}
      <div className="py-5 h-full">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={{
              content: m.content,
              createdAt: m.createdAt,
              user: { id: m.userId, role: m.role, name: m.name },
            }}
          />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          label="Enter your message"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <div className="flex justify-end">
          <Button>Send your message</Button>
        </div>
      </form>
    </>
  );
}
