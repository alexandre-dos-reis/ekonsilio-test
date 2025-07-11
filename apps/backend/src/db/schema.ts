import { sql } from "drizzle-orm";
import {
  pgTable,
  boolean,
  uuid,
  timestamp,
  varchar,
  text,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import type { Message } from "./types";

const primaryKeyColumn = {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
};

const timestampColumns = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  // https://github.com/drizzle-team/drizzle-orm/issues/956
};

//format: xx-XX | ex: fr-FR
const localeType = varchar({ length: 5 });

export const userRoleEnum = pgEnum("user_role", ["user", "genius"]);

export const abstractUsers = pgTable("abstract_users", {
  ...primaryKeyColumn,
  ...timestampColumns,
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: userRoleEnum(),
});
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => abstractUsers.id, {
      onDelete: "cascade",
    }),
  ...timestampColumns,
  locale: localeType,
});

export const genius = pgTable("genius", {
  id: uuid("id")
    .primaryKey()
    .references(() => abstractUsers.id, {
      onDelete: "cascade",
    }),
  ...timestampColumns,
  locales: localeType.array().default(sql`ARRAY[]::text[]`),
  isOnline: boolean("is_online").notNull().default(false),
});

export const sessions = pgTable("sessions", {
  ...primaryKeyColumn,
  ...timestampColumns,
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => abstractUsers.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  ...primaryKeyColumn,
  ...timestampColumns,
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => abstractUsers.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
});

export const verifications = pgTable("verifications", {
  ...primaryKeyColumn,
  ...timestampColumns,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const statusConvEnum = pgEnum("status", [
  // User has started a conversation, waiting for a genius.
  "init",
  // Conversation is active, both user and genius are having a conversation.
  "active",
  // Conversation is closed or too old.
  "inactive",
]);

export const conversations = pgTable("conversations", {
  ...primaryKeyColumn,
  ...timestampColumns,
  status: statusConvEnum(),
  userId: uuid("user_id").references(() => abstractUsers.id, {
    onDelete: "set null",
  }),
  geniusId: uuid("genius_id").references(() => genius.id, {
    onDelete: "set null",
  }),
  userMessages: jsonb().$type<Message[]>().default([]).notNull(),
  geniusMessages: jsonb().$type<Message[]>().default([]).notNull(),
});
