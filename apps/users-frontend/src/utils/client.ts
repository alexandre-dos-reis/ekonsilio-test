import { type CustomerRoutes } from "../../../backend/src/routes/customerRoutes";
import { type ChatRoutes } from "../../../backend/src/routes/chatRoutes";

import { hc } from "hono/client";
import type { Hono } from "hono";

const createClient = <THono extends Hono<any, any, any>>() =>
  hc<THono>("http://localhost:3001", {
    fetch: ((input, init) => {
      return fetch(input, {
        ...init,
        credentials: "include", // Required for sending cookies cross-origin
      });
    }) as typeof fetch,
  });

export const client = createClient<CustomerRoutes>().customers;
export const wsClient = createClient<ChatRoutes>();
