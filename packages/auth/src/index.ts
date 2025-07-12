import { accounts, sessions, users, verifications } from "@ek/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customerAuthBasePath, geniusAuthBasePath } from "./constants";

export * from "./constants";

export const getAuth = (args: {
  trustedOrigin: string;
  role: "customer" | "genius";
  basePath?: string;
  db: Parameters<typeof drizzleAdapter>[0];
}) =>
  betterAuth({
    basePath:
      args.role === "customer"
        ? customerAuthBasePath
        : args.role === "genius"
          ? geniusAuthBasePath
          : args.basePath,
    trustedOrigins: [args.trustedOrigin],
    database: drizzleAdapter(args.db, {
      provider: "pg",
      schema: {
        user: users,
        account: accounts,
        session: sessions,
        verification: verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({ data: { ...user, role: args.role } }),
        },
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false, // don't allow user to set role
        },
      },
    },
    advanced: {
      database: { generateId: false },
    },
  });

export type Auth = ReturnType<typeof getAuth>;
export type User = Auth["$Infer"]["Session"]["user"] | null | undefined;
export type Session = Auth["$Infer"]["Session"]["session"] | undefined | null;
