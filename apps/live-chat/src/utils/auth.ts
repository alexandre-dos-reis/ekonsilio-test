import { createAuthClient } from "better-auth/react";
import type { Auth } from "@ek/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  plugins: [inferAdditionalFields<Auth>()],
  basePath: "/auth",
});
