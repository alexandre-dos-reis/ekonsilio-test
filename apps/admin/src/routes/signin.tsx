import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/utils/auth";
import { toast } from "react-toastify";
import { useUserContext } from "@/contexts/user";
import { Button, Form, Input } from "@ek/ui";

export const Route = createFileRoute("/signin")({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("genius01@gmail.com");
  const [password, setPassword] = useState("password");
  const { setUser } = useUserContext();
  const navigate = useNavigate({ from: "/signin" });

  return (
    <>
      <h1 className="text-center">Login In</h1>
      <Form
        onSubmit={async (e) => {
          e.preventDefault();

          const { error, data } = await authClient.signIn.email({
            email,
            password,
            fetchOptions: { credentials: "include" },
          });

          if (error) {
            console.log(error);
            switch (error.code) {
              case "INVALID_EMAIL_OR_PASSWORD":
                toast("Email or password is invalid !", { type: "error" });
                break;
              default:
                toast("An error occured, try again later !", {
                  type: "error",
                });
            }
            return;
          }
          if (data) {
            setUser({ ...data.user, role: "user" });
            toast(`Hello ${data.user.name}, nice to see you here !`, {
              type: "success",
            });
            navigate({ to: "/" });
          }
        }}
      >
        <Input
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button>Log In</Button>
      </Form>
    </>
  );
}
