import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/utils/auth";
import { Input } from "@/components/Input";
import { toast } from "react-toastify";
import { Form } from "@/components/Form";
import { Button } from "@/components/Button";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: () => {
    const [email, setEmail] = useState("ajm.dosreis.daponte@gmail.com");
    const [name, setName] = useState("Alexandre Dos Reis");
    const [password, setPassword] = useState("password");
    const navigate = useNavigate({ from: "/signup" });

    return (
      <>
        <h1 className="text-center">Create your account</h1>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();

            const { error, data } = await authClient.signUp.email({
              email,
              password,
              name,
              fetchOptions: { credentials: "include" },
            });

            if (error) {
              switch (error.code) {
                case "USER_ALREADY_EXISTS":
                  toast("Email is already taken !", { type: "error" });
                  break;
                default:
                  toast("An error occured, try again later !", {
                    type: "error",
                  });
              }
              return;
            }
            if (data) {
              toast("Account created successfully, now try login in !", {
                type: "success",
              });
              navigate({ to: "/signin" });
            }
          }}
        >
          <Input
            name="name"
            type="text"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <Button>Create your account</Button>
        </Form>
      </>
    );
  },
});
