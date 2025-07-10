import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./apps/backend/src/db/migrations",
  schema: "./apps/backend/src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
    port: Number(process.env.POSTGRES_PORT!),
    host: "localhost",
    ssl: false,
  },
});
