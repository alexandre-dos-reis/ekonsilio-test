import { type Rpc } from "../../../backend/src/index.ts";
import { hc } from "hono/client";

export const client = hc<Rpc>("http://localhost:3001", {
  fetch: ((input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include", // Required for sending cookies cross-origin
    });
  }) as typeof fetch,
});
