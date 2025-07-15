import { getCustomerAuthClient } from "@ek/auth/react";

export const authClient = getCustomerAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
