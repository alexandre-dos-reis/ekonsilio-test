import { AnimatePing } from "./AnimatePing";
import { cn } from "./cn";
import { getRelativeTime } from "./func";

export type Props = {
  content: string;
  createdAt: string;
  userName: string;
  areYouTheUser: boolean;
  showDetails: boolean;
  picture: "kenobee" | "anakeen";
  isOnline?: boolean;
};

export const ChatBubble = ({
  createdAt,
  userName,
  areYouTheUser,
  content,
  showDetails,
  picture,
  isOnline,
}: Props) => {
  return (
    <div className={cn("chat", !areYouTheUser ? "chat-start" : "chat-end")}>
      <div className={cn("chat-image avatar", isOnline && "avatar-online")}>
        <div className="w-10 rounded-full ">
          <img
            alt="Tailwind CSS chat bubble component"
            src={`https://img.daisyui.com/images/profile/demo/${picture}@192.webp`}
          />
        </div>
      </div>
      <div className="chat-header relative">{userName}</div>
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
