import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { abstractUsers, accounts, sessions, verifications } from "./db/schema";
import { env } from "./env";

const authFn = (args: {
  trustedOrigin: string;
  role: "user" | "genius";
  basePath: string;
}) =>
  betterAuth({
    basePath: args.basePath,
    trustedOrigins: [args.trustedOrigin],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: abstractUsers,
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

export const auth = authFn({
  basePath: "/api/auth/user",
  role: "user",
  trustedOrigin: env.APP_USER_TRUSTED_ORIGIN,
});

export const userAuth = auth;

export const geniusAuth = authFn({
  basePath: "/api/auth/genius",
  role: "genius",
  trustedOrigin: env.APP_GENIUS_TRUSTED_ORIGIN,
});

export type Auth = ReturnType<typeof authFn>;
