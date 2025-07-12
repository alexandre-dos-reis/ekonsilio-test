import { getAuth } from "@ek/auth";
import { db } from "./db";
import { env } from "./env";

export const customerAuth = getAuth({
  db,
  role: "customer",
  trustedOrigin: env.APP_CUSTOMER_TRUSTED_ORIGIN,
});

export const geniusAuth = getAuth({
  db,
  role: "genius",
  trustedOrigin: env.APP_GENIUS_TRUSTED_ORIGIN,
});
