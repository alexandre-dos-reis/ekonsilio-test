import { getAuth } from "@ek/auth";
import { db } from "./db";
import { env } from "./env";

export const auth = getAuth({
  db,
  geniusTrustedOrigin: env.GENIUS_TRUSTED_ORIGIN,
  customerTrustedOrigin: env.CUSTOMER_TRUSTED_ORIGIN,
  secret: env.AUTH_SECRET,
});
