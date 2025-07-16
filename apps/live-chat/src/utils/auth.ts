import { getAuthClient } from "@ek/clients";

export const authClient = getAuthClient(import.meta.env.VITE_BACKEND_URL);
