import { getAuthClient } from "@ek/auth/react";

export const authClient = getAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
