import { env } from "./env";
import { getDatabase } from "@ek/db";

export const db = getDatabase({
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT,
  host: env.POSTGRES_HOST,
});
