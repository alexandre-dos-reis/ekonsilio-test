import type { User } from "@ek/auth";
import { getData, sendData } from "@ek/shared";
import { Alert, Button, ChatBubble, cn, Input } from ".";
import { formatISO } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  websocketGetter: () => WebSocket;
  user: User;
  avatar: "anakeen" | "kenobee";
  conversation: {
    messages: {
      userId: string;
      name: string;
      role: "customer" | "genius";
      id: string;
      content: string;
      createdAt: string;
    }[];
    id: string;
    status: "init" | "inactive" | "active" | null;
    createdAt: string;
  };
}
export const ChatConversation = ({
  conversation,
  user,
  websocketGetter,
  avatar,
}: Props) => {
  const [status, setStatus] = useState<(typeof conversation)["status"]>(
    conversation?.status || "init",
  );
  const [onlineUsers, setOnlineUsers] = useState<Array<string>>();
  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState("");
  const ws = useMemo(websocketGetter, []);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const onMessage = useCallback((event: MessageEvent) => {
    const message = getData(event.data);

    switch (message.event) {
      case "message":
        setMessages((messages) => [
          ...messages,
          {
            userId: message.data.user.id,
            id: message.data.createdAt,
            content: message.data.content,
            name: message.data.user.name,
            createdAt: message.data.createdAt,
            role: message.data.user.role as "customer",
          },
        ]);
        break;
      case "join-conversation":
        if (message.data.conversationStatus) {
          setStatus(message.data.conversationStatus);
        }
        toast(`${message.data.userName} has join the conversation !`, {
          type: "info",
        });
        break;
      case "quit-conversation":
        if (message.data.conversationStatus) {
          setStatus(message.data.conversationStatus);
        }
        toast(`${message.data.userName} has left the conversation !`, {
          type: "info",
        });
        break;
      case "users-currently-present-in-the-conversation":
        setOnlineUsers(message.data.usersId);
        break;
    }
  }, []);

  useEffect(() => {
    ws.addEventListener("message", onMessage);
    return () => {
      ws.removeEventListener("message", onMessage);
      ws.close();
    };
  }, []);

  // Always scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
      <div
        className={cn(
          "py-5 overflow-y-scroll ",
          status === "init" || status === "inactive"
            ? "max-h-[calc(100vh-17rem)]"
            : "max-h-[calc(100vh-14rem)]",
        )}
        ref={messagesRef}
      >
        {messages.map((m, i) => (
          <ChatBubble
            key={m.id}
            showDetails={messages.length === i + 1}
            areYouTheUser={m.userId === user?.id}
            userName={m.name}
            content={m.content}
            createdAt={m.createdAt}
            picture={
              m.userId === user?.id
                ? avatar
                : user?.role === "customer"
                  ? "kenobee"
                  : "anakeen"
            }
            isOnline={!!onlineUsers?.find((userId) => userId === m.userId)}
          />
        ))}
      </div>
      <form
        className="bg-base-100 h-[17rem]"
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
                    role: user.role!,
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
};
