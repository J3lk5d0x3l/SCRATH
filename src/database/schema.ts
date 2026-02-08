import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    discordId: text('discordId').notNull().unique(),
    username: text('username').notNull(),
    discriminator: text('discriminator'),
    avatar: text('avatar'),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({ createdAtIdx: index('users_createdAt_idx').on(table.createdAt) })
);

export const guilds = sqliteTable(
  'guilds',
  {
    id: text('id').primaryKey(),
    discordId: text('discordId').notNull().unique(),
    name: text('name').notNull(),
    icon: text('icon'),
    memberCount: integer('memberCount').default(0).notNull(),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({ createdAtIdx: index('guilds_createdAt_idx').on(table.createdAt) })
);

export const guildSettings = sqliteTable(
  'guild_settings',
  {
    id: text('id').primaryKey(),
    guildId: text('guildId').notNull().unique(),
    prefix: text('prefix').default('!').notNull(),
    language: text('language').default('es').notNull(),
    loggingEnabled: integer('loggingEnabled', { mode: 'boolean' }).default(true).notNull(),
    automodEnabled: integer('automodEnabled', { mode: 'boolean' }).default(false).notNull(),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
  }
);

export const guildMembers = sqliteTable(
  'guild_members',
  {
    id: text('id').primaryKey(),
    guildId: text('guildId').notNull(),
    userId: text('userId').notNull(),
    joinedAt: text('joinedAt').notNull().$defaultFn(() => new Date().toISOString()),
    leftAt: text('leftAt'),
  },
  (table) => ({ guildUserUnique: unique().on(table.guildId, table.userId) })
);

export const warnings = sqliteTable(
  'warnings',
  {
    id: text('id').primaryKey(),
    guildId: text('guildId').notNull(),
    userId: text('userId').notNull(),
    moderatorId: text('moderatorId').notNull(),
    reason: text('reason').notNull(),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    guildUserIdx: index('warnings_guildId_userId_idx').on(table.guildId, table.userId),
    createdAtIdx: index('warnings_createdAt_idx').on(table.createdAt),
  })
);

export const bans = sqliteTable(
  'bans',
  {
    id: text('id').primaryKey(),
    guildId: text('guildId').notNull(),
    userId: text('userId').notNull(),
    moderatorId: text('moderatorId').notNull(),
    reason: text('reason'),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    expiresAt: text('expiresAt'),
  },
  (table) => ({
    guildUserUnique: unique().on(table.guildId, table.userId),
    expiresAtIdx: index('bans_expiresAt_idx').on(table.expiresAt),
  })
);

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    guildId: text('guildId'),
    action: text('action').notNull(),
    actorId: text('actorId'),
    targetId: text('targetId'),
    resourceType: text('resourceType'),
    resourceId: text('resourceId'),
    payload: text('payload'),
    status: text('status').default('SUCCESS').notNull(),
    errorMessage: text('errorMessage'),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    guildIdx: index('audit_logs_guildId_idx').on(table.guildId),
    createdAtIdx: index('audit_logs_createdAt_idx').on(table.createdAt),
  })
);

export const featureFlags = sqliteTable(
  'feature_flags',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    enabled: integer('enabled', { mode: 'boolean' }).default(false).notNull(),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
  }
);

export const featureFlagOverrides = sqliteTable(
  'feature_flag_overrides',
  {
    id: text('id').primaryKey(),
    flagKey: text('flagKey').notNull(),
    guildId: text('guildId'),
    enabled: integer('enabled', { mode: 'boolean' }).notNull(),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({ guildFlagUnique: unique().on(table.guildId, table.flagKey) })
);

export const state = sqliteTable(
  'state',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    value: text('value').notNull(),
    expiresAt: text('expiresAt'),
    createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
  }
);

