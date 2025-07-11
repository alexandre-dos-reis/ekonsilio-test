import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { type Auth } from "./types";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [inferAdditionalFields<Auth>()],
  basePath: "/api/auth/user",
});
