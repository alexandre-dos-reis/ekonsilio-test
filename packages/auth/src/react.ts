import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { type Auth } from "./index";
import { customerAuthBasePath, geniusAuthBasePath } from "./constants";

export const getCustomerAuthClient = ({ baseURL }: { baseURL: string }) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: customerAuthBasePath,
  });

export const getGeniusAuthClient = ({ baseURL }: { baseURL: string }) =>
  createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
    basePath: geniusAuthBasePath,
  });
