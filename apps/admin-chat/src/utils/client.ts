import { type GeniusRoutes } from "../../../backend/src/routes/geniusRoutes";
import { type ChatRoutes } from "../../../backend/src/routes/chatRoutes";

import { hc } from "hono/client";
import type { Hono } from "hono";

const createClient = <THono extends Hono<any, any, any>>() =>
  hc<THono>(import.meta.env.VITE_BACKEND_URL,, {
    fetch: ((input, init) => {
      return fetch(input, {
        ...init,
        credentials: "include", // Required for sending cookies cross-origin
      });
    }) as typeof fetch,
  });

export const client = createClient<GeniusRoutes>().genius;
export const wsClient = createClient<ChatRoutes>();
