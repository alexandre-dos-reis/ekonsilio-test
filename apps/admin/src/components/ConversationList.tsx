import type { Conversations } from "@/routes";
import { getRelativeTime, AnimatePing } from "@ek/ui";
import { Link } from "@tanstack/react-router";

interface Props {
  conversations: Conversations;
  showPulse?: boolean;
}
export const ConversationList = ({ conversations, showPulse }: Props) => {
  return conversations.length === 0 ? (
    <div className="italic text-center text-sm text-neutral-500">
      None at the moment, please wait.
    </div>
  ) : (
    <ul className="list gap-2">
      {conversations.map((c) => (
        <Link
          key={c.conversationId}
          to="/chat/$conversationId"
          params={{ conversationId: c.conversationId }}
          className="list-row bg-base-300 relative"
        >
          <div>
            <div>
              <span className="font-bold">{c.content}</span>
            </div>
            <div>
              by <span className="italic">{c.userName}</span>
            </div>
            <div>
              <span className="text-neutral-600">
                {getRelativeTime(c.createdAt)}
              </span>
            </div>
            {showPulse && <AnimatePing />}
          </div>
        </Link>
      ))}
    </ul>
  );
};
