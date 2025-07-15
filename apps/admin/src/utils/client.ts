import type { GeniusRoutes, ChatRoutes } from "@ek/backend";
import { createClient } from "@ek/shared";

export const client = createClient<GeniusRoutes>(
  import.meta.env.VITE_BACKEND_URL,
).genius;

export const wsClient = createClient<ChatRoutes>(
  import.meta.env.VITE_BACKEND_URL,
);
