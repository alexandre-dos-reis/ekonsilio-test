import type { GeniusRoutes } from "../../../backend/src/routes/geniusRoutes";
import type { ChatRoutes } from "../../../backend/src/routes/chatRoutes";
import { createClient } from "@ek/shared";

export const client = createClient<GeniusRoutes>(
  import.meta.env.VITE_BACKEND_URL,
).genius;

export const wsClient = createClient<ChatRoutes>(
  import.meta.env.VITE_BACKEND_URL,
);
