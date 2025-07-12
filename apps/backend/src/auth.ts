import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { users, accounts, sessions, verifications } from "./db/schema";
import { env } from "./env";

const authFn = (args: {
  trustedOrigin: string;
  role: "customer" | "genius";
  basePath: string;
}) =>
  betterAuth({
    basePath: args.basePath,
    trustedOrigins: [args.trustedOrigin],
    database: drizzleAdapter(db, {
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

const basePath = "/auth";

export const customerAuthBasePath = `${basePath}/customer`;
export const geniusAuthBasePath = `${basePath}/genius`;

export const customerAuth = authFn({
  basePath: customerAuthBasePath,
  role: "customer",
  trustedOrigin: env.APP_CUSTOMER_TRUSTED_ORIGIN,
});

export const geniusAuth = authFn({
  basePath: geniusAuthBasePath,
  role: "genius",
  trustedOrigin: env.APP_GENIUS_TRUSTED_ORIGIN,
});

export const auth = customerAuth;

export type Auth = typeof auth;
