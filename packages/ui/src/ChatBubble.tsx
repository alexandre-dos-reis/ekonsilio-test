import { cn } from "./cn";
import { getRelativeTime } from "./func";

export type Props = {
  content: string;
  createdAt: string;
  userName: string;
  areYouTheUser: boolean;
  showDetails: boolean;
};

export const ChatBubble = ({
  createdAt,
  userName,
  areYouTheUser,
  content,
  showDetails,
}: Props) => {
  return (
    <div className={cn("chat", !areYouTheUser ? "chat-start" : "chat-end")}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src={
              !areYouTheUser
                ? "https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                : "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
            }
          />
        </div>
      </div>
      <div className="chat-header">{userName}</div>
      <div
        className={cn(
          "chat-bubble",
          !areYouTheUser ? "chat-bubble-accent" : "chat-bubble-info",
        )}
      >
        {content}
      </div>
      {showDetails && (
        <time className="chat-footer text-xs opacity-50">
          {areYouTheUser && "You, "}
          {getRelativeTime(createdAt)}
        </time>
      )}
    </div>
  );
};
