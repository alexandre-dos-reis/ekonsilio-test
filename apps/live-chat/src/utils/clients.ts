import type { CustomerRoutes, ChatRoutes } from "@ek/backend";
import { getAuthClient, createClient } from "@ek/clients";

export const client = createClient<CustomerRoutes>(
  import.meta.env.VITE_BACKEND_URL,
).customers;

export const wsClient = createClient<ChatRoutes>(
  import.meta.env.VITE_BACKEND_URL,
);

export const authClient = getAuthClient(import.meta.env.VITE_BACKEND_URL);
