import type { GeniusRoutes, ChatRoutes } from "@ek/backend";
import { createClient, getAuthClient } from "@ek/clients";

export const client = createClient<GeniusRoutes>(
  import.meta.env.VITE_BACKEND_URL,
).genius;

export const wsClient = createClient<ChatRoutes>(
  import.meta.env.VITE_BACKEND_URL,
);

export const authClient = getAuthClient(import.meta.env.VITE_BACKEND_URL);
