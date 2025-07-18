import type { CustomerRoutes, ChatRoutes } from "@ek/backend";
import { getAuthClient, createClient } from "@ek/clients";

const url = import.meta.env.VITE_BACKEND_URL;

export const client = createClient<CustomerRoutes>(url).customers;

export const wsClient = createClient<ChatRoutes>(url);

export const authClient = getAuthClient(url);
