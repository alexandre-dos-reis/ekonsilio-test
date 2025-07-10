import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/utils/auth";
import { Input } from "@/components/Input";
import { toast } from "react-toastify";
import { useUserContext } from "@/contexts/user";

export const Route = createFileRoute("/signup")({
  component: Index,
});

function Index() {
  const [email, setEmail] = useState("ajm.dosreis.daponte@gmail.com");
  const [name, setName] = useState("Alexandre Dos Reis");
  const [password, setPassword] = useState("password");
  const { setUser } = useUserContext();
  const navigate = useNavigate({ from: "/signup" });
  return (
    <div className="p-2">
      <h1 className="text-center">Create your account</h1>
      <form
        className="flex flex-col gap-3"
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
                toast("An error occured, try again later !", { type: "error" });
            }
            return;
          }
          if (data) {
            setUser({ ...data.user, role: "user" });
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
        <div className="flex items-center justify-center">
          <button className="btn btn-primary">Create your account</button>
        </div>
      </form>
    </div>
  );
}
