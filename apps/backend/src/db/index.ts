import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT,
  host: env.POSTGRES_HOST,
});

export const db = drizzle({ client: pool, schema });
