import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../env";

async function runMigration() {
  console.log("Migration started ⌛");

  // Not using the getDbUrl helper function because we aren't copying that into our runtime app prior to deployment in our Dockerfile. We'll live with the code duplication.
  const dbUrl = `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;

  if (!dbUrl) throw new Error("No database url found");

  const client = postgres(dbUrl, {
    max: 1,
  });

  const db = drizzle(client);
  try {
    await migrate(db, {
      migrationsFolder: "../../../../packages/db/src/migrations",
    });
    console.log("Migration completed ✅");
  } catch (error) {
    console.error("Migration failed 🚨:", error);
  } finally {
    await client.end();
  }
}

runMigration().catch((error) =>
  console.error("Error in migration process 🚨:", error),
);
