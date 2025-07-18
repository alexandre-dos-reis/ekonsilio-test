import { ChatConversation } from "@ek/ui";
import { client, wsClient } from "@/utils/clients";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useUserContext } from "@/contexts/user";

export const Route = createFileRoute("/chat/$conversationId")({
  component: RouteComponent,
  loader: async ({ params: { conversationId } }) => {
    const res = await client.conversations[":id"].$get({
      param: { id: conversationId },
    });

    if (res.ok) {
      return res.json();
    } else {
      throw redirect({
        to: "/signin",
      });
    }
  },
});

function RouteComponent() {
  const conversation = Route.useLoaderData();
  const { conversationId } = Route.useParams();
  const { user } = useUserContext();

  const wsGetter = () =>
    wsClient.chat[":conversationId"].$ws({
      param: { conversationId },
    });

  if (!conversation) {
    return null;
  }

  return (
    <ChatConversation
      conversation={conversation}
      websocketGetter={wsGetter}
      user={user}
      avatar="anakeen"
    />
  );
}
