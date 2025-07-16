import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { type Auth } from "./index";
import { authBasePath } from "./constants";

export const getAuthClient = ({ baseURL }: { baseURL: string }) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: authBasePath,
  });
