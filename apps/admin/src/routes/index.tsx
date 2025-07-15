import { client } from "@/utils/client";
import { Button, Input, getRelativeTime } from "@ek/ui";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/signin",
      });
    }
  },
  loader: async () => {
    // const res = await client.conversations.$get();
    // return res.json();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const conversations = Route.useLoaderData();

  return <div></div>;
}
