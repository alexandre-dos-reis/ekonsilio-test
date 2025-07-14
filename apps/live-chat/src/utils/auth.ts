import { getCustomerAuthClient } from "@ek/auth/react";
import { env } from "./env";

export const authClient = getCustomerAuthClient({
  baseURL: env.VITE_BACKEND_URL,
});
