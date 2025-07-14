export * from "@t3-oss/env-core";
import { z } from "zod";

export const setPortSchema = (defaultPort: number) =>
  z.preprocess(
    (value) => Number(value),
    z.number().gte(1000).lte(65535).default(defaultPort),
  );

export const stringSchema = z.string().nonempty();
