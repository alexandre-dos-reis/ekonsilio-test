import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ["../../.env", ".env"] });

export default defineConfig({
  out: "src/migrations",
  schema: "src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
    port: Number(process.env.POSTGRES_PORT!),
    host: process.env.POSTGRES_HOST! || "localhost",
    ssl: false,
  },
});
