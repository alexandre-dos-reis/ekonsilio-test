import { createAuthClient } from "better-auth/react";
import type { Auth } from "@ek/auth";
import { authBasePath } from "@ek/shared";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const getAuthClient = (baseURL: string) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: authBasePath,
  });
