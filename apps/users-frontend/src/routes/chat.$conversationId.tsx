import { Alert, Button, ChatBubble, Input, type Message } from "@ek/ui";
import { client } from "@/utils/client";
import {
  createFileRoute,
  type RegisteredRouter,
  type RouteById,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

  const customerMessages = conversation.customerMessages.map((m) => ({
    ...m,
    user: conversation.customer!,
  }));

  const geniusMessages = conversation.geniusMessages.map((m) => ({
    ...m,
    user: conversation.genius!,
  }));

  return [...customerMessages, ...geniusMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}

function RouteComponent() {
  const conversation = Route.useLoaderData();
  const { conversationId } = Route.useParams();

  const [status, setStatus] = useState<
    NonNullable<typeof conversation>["status"]
  >(conversation?.status || "init");

  const [messages, setMessages] = useState<Array<Message>>(
    getMessages(conversation),
  );

  const ws = client.chat[":conversationId"].ws.$ws({
    param: { conversationId },
  });

  useEffect(() => {
    ws.addEventListener("open", (event) => {
      console.log("client open event");
      // ws.send("client connected");
    });
    ws.addEventListener("message", (event) => {
      console.log("client message event");
      console.log(event.data);
    });
    ws.addEventListener("close", (event) => {
      console.log("client close event");
    });
    ws.addEventListener("error", (event) => {
      console.log("client error event");
    });

    return () => {
      ws.removeEventListener("open", (event) => {});
      ws.removeEventListener("message", (event) => {});
      ws.removeEventListener("close", (event) => {});
      ws.removeEventListener("error", (event) => {});
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
