import { getCustomerAuthClient } from "@ek/auth/react";

export const authClient = getCustomerAuthClient({
  baseURL: "http://localhost:3001",
});
