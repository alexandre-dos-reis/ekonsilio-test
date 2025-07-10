import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { type Auth } from "../../../backend/src/auth";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [inferAdditionalFields<Auth>()],
});
