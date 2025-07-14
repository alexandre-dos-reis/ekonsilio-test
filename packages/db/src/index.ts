import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
export * from "drizzle-orm";

export * from "./schema";

export const getDatabase = (config?: PoolConfig) => {
  return drizzle({ client: new Pool(config), schema, logger: false });
};
