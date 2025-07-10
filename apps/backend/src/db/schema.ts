import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  boolean,
  uuid,
  timestamp,
  varchar,
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

export const users = pgTable("users", {
  ...primaryKeyColumn,
  ...timestampColumns,
  locale: localeType,
});

export const genius = pgTable("genius", {
  ...primaryKeyColumn,
  ...timestampColumns,
  locales: localeType.array().default(sql`ARRAY[]::text[]`),
  isOnline: boolean("is_online").notNull().default(false),
});

export const conversations = pgTable("conversations", {
  ...primaryKeyColumn,
  ...timestampColumns,
  user: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  genius: uuid("genius_id").references(() => genius.id, {
    onDelete: "set null",
  }),
});
