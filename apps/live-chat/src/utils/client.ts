import type { CustomerRoutes, ChatRoutes } from "@ek/backend";
import { createClient } from "@ek/shared";

export const client = createClient<CustomerRoutes>(
  import.meta.env.VITE_BACKEND_URL,
).customers;

export const wsClient = createClient<ChatRoutes>(
  import.meta.env.VITE_BACKEND_URL,
);
