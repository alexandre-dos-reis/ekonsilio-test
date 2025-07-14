import { getAuth } from "@ek/auth";
import { db } from "./db";
import { env } from "./env";

export const customerAuth = getAuth({
  db,
  role: "customer",
  trustedOrigin: env.CUSTOMER_TRUSTED_ORIGIN,
  secret: env.CUSTOMER_AUTH_SECRET,
});

export const geniusAuth = getAuth({
  db,
  role: "genius",
  trustedOrigin: env.GENIUS_TRUSTED_ORIGIN,
  secret: env.GENIUS_AUTH_SECRET,
});
