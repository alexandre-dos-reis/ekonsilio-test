import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

export * from "./schema";
export * from "./types";

export const getDatabase = (config?: PoolConfig) => {
  return drizzle({ client: new Pool(config), schema });
};
