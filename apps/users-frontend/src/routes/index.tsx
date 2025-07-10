import { useUserContext } from "@/contexts/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUserContext();
  return (
    <>
      <pre>{JSON.stringify(user, null, 4)}</pre>
    </>
  );
}
