import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const portSchema = (defaultPort: number = 3000) =>
  z.preprocess(
    (value) => Number(value),
    z.number().gte(1000).lte(65535).default(defaultPort),
  );

const stringSchema = z.string().nonempty();

export const env = createEnv({
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  server: {
    PORT: portSchema(3000),
    APP_CUSTOMER_TRUSTED_ORIGIN: z.url(),
    APP_GENIUS_TRUSTED_ORIGIN: z.url(),

    POSTGRES_USER: stringSchema,
    POSTGRES_PASSWORD: stringSchema,
    POSTGRES_DB: stringSchema,
    POSTGRES_PORT: portSchema(5432),
    POSTGRES_HOST: stringSchema.default("localhost"),
  },
});
