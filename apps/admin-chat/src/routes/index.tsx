import { client, wsClient } from "@/utils/client";
import { Button, Input, getRelativeTime } from "@ek/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ws = useMemo(() => wsClient.chat.all.$ws(), []);
  console.log(ws);

  const onMessage = useCallback((event) => {
    console.log(event.data);
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
      <h2 className="text-2xl font-bold">Monitors</h2>
    </>
  );
}
