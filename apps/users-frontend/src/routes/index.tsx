import { Button } from "@/components/Button";
import { ChatBubble } from "@/components/ChatBubble";
import { Input } from "@/components/Input";
import { useUserContext } from "@/contexts/user";
import type { User } from "@/utils/types";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUserContext();
  const genius: User = { role: "genius", name: "Genius John" };

  if (!user) return null;

  return (
    <>
      <div className="py-5 h-full">
        <ChatBubble
          user={user!}
          message={{ content: "Hello there !", createdAt: "5 min ago" }}
        />
        <ChatBubble
          user={genius}
          message={{ content: "How can I help you ?", createdAt: "5 min ago" }}
        />
      </div>
      <Input label="Enter your message" />
      <div className="flex justify-end">
        <Button>Send your message</Button>
      </div>
    </>
  );
}
