import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/utils/auth";
import { Input } from "@/components/Input";

export const Route = createFileRoute("/signup")({
  component: Index,
});

function Index() {
  const [email, setEmail] = useState("ajm.dosreis.daponte@gmail.com");
  const [password, setPassword] = useState("password");
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
            name: email,
            fetchOptions: { credentials: "include" },
          });

          console.log(error);
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
        <div className="flex items-center justify-center">
          <button className="btn btn-primary">Create your account</button>
        </div>
      </form>
    </div>
  );
}
