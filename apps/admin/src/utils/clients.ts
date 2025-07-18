import type { GeniusRoutes, ChatRoutes } from "@ek/backend";
import { createClient, getAuthClient } from "@ek/clients";

const url = import.meta.env.VITE_BACKEND_URL;

export const client = createClient<GeniusRoutes>(url).genius;

export const wsClient = createClient<ChatRoutes>(url);

export const authClient = getAuthClient(url);
