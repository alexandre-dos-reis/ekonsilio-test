import { sql } from "drizzle-orm";
import {
  pgTable,
  boolean,
  uuid,
  timestamp,
  text,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

const primaryKeyColumn = {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
};

const timestampColumns = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  // https://github.com/drizzle-team/drizzle-orm/issues/956
};

export const userRoleEnum = pgEnum("user_role", ["customer", "genius"]);

export const users = pgTable("users", {
  ...primaryKeyColumn,
  ...timestampColumns,
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: userRoleEnum().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    ...primaryKeyColumn,
    ...timestampColumns,
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_user_id_index").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    ...primaryKeyColumn,
    ...timestampColumns,
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
  },
  (table) => [index("accounts_user_id_index").on(table.userId)],
);

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

export const conversations = pgTable(
  "conversations",
  {
    ...primaryKeyColumn,
    ...timestampColumns,
    status: statusConvEnum(),
    createdById: uuid("created_by_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [index("conversations_created_by_id_index").on(table.createdById)],
);

export const messages = pgTable(
  "messages",
  {
    ...primaryKeyColumn,
    ...timestampColumns,
    content: text("content").notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },

  (table) => [
    index("messages_user_id_index").on(table.userId),
    index("messages_conversation_id_index").on(table.conversationId),
  ],
);
