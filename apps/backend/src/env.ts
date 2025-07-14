import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const setPortSchema = (defaultPort: number) =>
  z.preprocess(
    (value) => Number(value),
    z.number().gte(1000).lte(65535).default(defaultPort),
  );

export const stringSchema = z.string().nonempty();

export const env = createEnv({
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  server: {
    PORT: setPortSchema(3000),

    CUSTOMER_TRUSTED_ORIGIN: z.url(),
    CUSTOMER_AUTH_SECRET: stringSchema.default("my-customer-auth-secret"),

    GENIUS_TRUSTED_ORIGIN: z.url(),
    GENIUS_AUTH_SECRET: stringSchema.default("my-genius-auth-secret"),

    POSTGRES_USER: stringSchema,
    POSTGRES_PASSWORD: stringSchema,
    POSTGRES_DB: stringSchema,
    POSTGRES_PORT: setPortSchema(5432),
    POSTGRES_HOST: stringSchema.default("localhost"),
  },
});
