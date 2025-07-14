import { getGeniusAuthClient } from "@ek/auth/react";
import { env } from "./env";

export const authClient = getGeniusAuthClient({
  baseURL: env.VITE_BACKEND_URL,
});
