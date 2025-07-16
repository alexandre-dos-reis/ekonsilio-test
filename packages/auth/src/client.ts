import { createAuthClient } from "better-auth/react";
import { type Auth } from "./index";
import { authBasePath } from "./constants";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const getAuthClient = ({ baseURL }: { baseURL: string }) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: authBasePath,
  });
