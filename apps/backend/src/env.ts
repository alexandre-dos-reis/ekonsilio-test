import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const portSchema = z.preprocess(
  (value) => Number(value),
  z.number().gte(1000).lte(65535).default(3000),
);

const stringSchema = z.string().nonempty();

export const env = createEnv({
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  server: {
    PORT: portSchema,
    POSTGRES_USER: stringSchema,
    POSTGRES_PASSWORD: stringSchema,
    POSTGRES_DB: stringSchema,
    POSTGRES_PORT: portSchema,
    POSTGRES_HOST: stringSchema.default("localhost"),
  },
});
