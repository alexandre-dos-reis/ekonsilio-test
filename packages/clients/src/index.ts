import { createAuthClient } from "better-auth/react";
import type { Auth } from "@ek/auth";
import { authBasePath } from "@ek/shared";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Hono } from "hono";
import { hc } from "hono/client";

export const getAuthClient = (baseURL: string) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: authBasePath,
  });

export const createClient = <THono extends Hono<any, any, any>>(
  backendUrl: string,
) =>
  hc<THono>(backendUrl, {
    fetch: ((input, init) => {
      return fetch(input, {
        ...init,
        credentials: "include", // Required for sending cookies cross-origin
      });
    }) as typeof fetch,
  });
