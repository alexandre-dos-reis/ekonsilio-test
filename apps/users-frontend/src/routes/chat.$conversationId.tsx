import { Alert, Button, ChatBubble, Input } from "@ek/ui";
import { client, wsClient } from "@/utils/client";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getData, sendData } from "@ek/shared";
import { useUserContext } from "@/contexts/user";
import { formatISO } from "date-fns";

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
  const { user } = useUserContext();

  const [status, setStatus] = useState<
    NonNullable<typeof conversation>["status"]
  >(conversation?.status || "init");

  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState("");

  const ws = useMemo(
    () =>
      wsClient.chat[":conversationId"].$ws({
        param: { conversationId },
      }),
    [],
  );

  const onMessage = useCallback((event: MessageEvent) => {
    const message = getData(event.data);
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
        {messages.map((m, i) => (
          <ChatBubble
            key={m.id}
            showDetails={messages.length === i + 1}
            areYouTheUser={m.userId === user?.id}
            userName={m.name}
            content={m.content}
            createdAt={m.createdAt}
          />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input && user) {
            const isoDate = formatISO(new Date());

            setMessages((messages) => [
              ...messages,
              {
                id: isoDate,
                content: input,
                createdAt: isoDate,
                role: user.role as "customer",
                name: user.name,
                userId: user.id,
              },
            ]);
            ws.send(
              sendData({
                event: "message",
                data: {
                  content: input,
                  createdAt: isoDate,
                  user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                  },
                },
              }),
            );

            setInput("");
          }
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
