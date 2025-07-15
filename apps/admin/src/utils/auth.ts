import { getGeniusAuthClient } from "@ek/auth/react";

export const authClient = getGeniusAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
