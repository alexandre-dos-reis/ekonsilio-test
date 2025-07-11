import type { Auth as BackendAuth } from "../../../backend/src/exports/client-types";

export type User = BackendAuth["$Infer"]["Session"]["user"] | undefined | null;

export type Auth = BackendAuth;
