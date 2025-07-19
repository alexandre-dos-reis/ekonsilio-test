import { accounts, sessions, users, verifications } from "@ek/db";
import { authBasePath } from "@ek/shared";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const getAuth = (args: {
  customerTrustedOrigin: string;
  geniusTrustedOrigin: string;
  db: Parameters<typeof drizzleAdapter>[0];
  secret: string; // Used for signing, hashing and encryption
}) =>
  betterAuth({
    basePath: authBasePath,
    trustedOrigins: [args.customerTrustedOrigin, args.geniusTrustedOrigin],
    secret: args.secret,
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
          before: async (user, ctx) => {
            const origin = ctx?.request?.headers.get("origin");
            let role: string | null = null;

            switch (origin) {
              case args.geniusTrustedOrigin:
                role = "genius";
                break;
              case args.customerTrustedOrigin:
                role = "customer";
                break;
              default:
                throw new APIError("BAD_REQUEST", {
                  message: `Unable to retrieve a role based on the current Origin header ! Origin: ${origin}`,
                });
            }

            return { data: { ...user, role } };
          },
        },
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false, // is false for the handler but not for the db, see above
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
