import type { User } from "@/utils/types";
import { cn } from "@ek/style";

export const ChatBubble = ({
  user,
  message,
}: {
  user: NonNullable<User>;
  message: { content: string; createdAt: string };
}) => {
  const isGenius = user.role === "genius";
  const isUser = user.role === "user";
  return (
    <div className={cn("chat", isGenius ? "chat-start" : "chat-end")}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src={
              isGenius
                ? "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                : "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
            }
          />
        </div>
      </div>
      <div className="chat-header">{user.name}</div>
      <div
        className={cn(
          "chat-bubble",
          isGenius ? "chat-bubble-accent" : "chat-bubble-info",
        )}
      >
        {message.content}
      </div>
      <time className="chat-footer text-xs opacity-50">
        {isUser && "You - "}
        {message.createdAt}
      </time>
    </div>
  );
};
