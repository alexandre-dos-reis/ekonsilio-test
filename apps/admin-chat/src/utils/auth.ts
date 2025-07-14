import { getGeniusAuthClient } from "@ek/auth/react";
import { env } from "./env";

export const authClient = getGeniusAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
