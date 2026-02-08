import { getDatabase } from './client.js';
import { users, guilds, guildSettings, guildMembers, warnings, bans, auditLogs, featureFlags, state } from './schema.js';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export function createRepositories() {
  const db = getDatabase();

  return {
    // === Users ===
    async getOrCreateUser(discordId: string, username: string, avatar?: string) {
      const existing = await db.select().from(users).where(eq(users.discordId, discordId)).limit(1);
      if (existing.length > 0) return existing[0];
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(users).values({ id, discordId, username, avatar: avatar || null, createdAt: now, updatedAt: now }).catch(() => null);
      return { id, discordId, username, avatar: avatar || null, createdAt: now, updatedAt: now };
    },

    async getUserById(userId: string) {
      return db.select().from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] || null);
    },

    // === Guilds ===
    async getOrCreateGuild(discordId: string, name: string, icon?: string) {
      const existing = await db.select().from(guilds).where(eq(guilds.discordId, discordId)).limit(1);
      if (existing.length > 0) return existing[0];
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(guilds).values({ id, discordId, name, icon: icon || null, createdAt: now, updatedAt: now }).catch(() => null);
      return { id, discordId, name, icon: icon || null, createdAt: now, updatedAt: now };
    },

    async getGuildByDiscordId(discordId: string) {
      return db.select().from(guilds).where(eq(guilds.discordId, discordId)).limit(1).then((r) => r[0] || null);
    },

    // === Guild Settings ===
    async getGuildSettingsByGuildId(discordGuildId: string) {
      return db.select().from(guildSettings).where(eq(guildSettings.guildId, discordGuildId)).limit(1).then((r) => r[0] || null);
    },

    async upsertGuildSettings(discordGuildId: string, data: Partial<typeof guildSettings.$inferInsert>) {
      const existing = await db.select().from(guildSettings).where(eq(guildSettings.guildId, discordGuildId)).limit(1);
      if (existing.length > 0) {
        const now = new Date().toISOString();
        await db.update(guildSettings).set({ ...data, updatedAt: now }).where(eq(guildSettings.guildId, discordGuildId)).catch(() => null);
        return { ...existing[0], ...data };
      }
      const id = randomUUID();
      const now = new Date().toISOString();
      const record = { id, guildId: discordGuildId, createdAt: now, updatedAt: now, ...data };
      await db.insert(guildSettings).values(record as any).catch(() => null);
      return record;
    },

    // === Guild Members ===
    async upsertGuildMember(guildId: string, userId: string) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(guildMembers).values({ id, guildId, userId, joinedAt: now }).onConflictDoNothing().catch(() => null);
      return { id, guildId, userId, joinedAt: now };
    },

    // === Warnings ===
    async addWarning(guildId: string, userId: string, moderatorId: string, reason: string) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(warnings).values({ id, guildId, userId, moderatorId, reason, createdAt: now }).catch(() => null);
      return { id, guildId, userId, moderatorId, reason, createdAt: now };
    },

    async listWarnings(guildId: string, userId: string) {
      return db.select().from(warnings).where(and(eq(warnings.guildId, guildId), eq(warnings.userId, userId))).orderBy(desc(warnings.createdAt));
    },

    async clearWarnings(guildId: string, userId: string) {
      return db.delete(warnings).where(and(eq(warnings.guildId, guildId), eq(warnings.userId, userId))).catch(() => ({ changes: 0 }));
    },

    // === Bans ===
    async createBan(guildId: string, userId: string, moderatorId: string, reason?: string, expiresAt?: Date) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(bans).values({ id, guildId, userId, moderatorId, reason: reason || null, expiresAt: expiresAt?.toISOString() || null, createdAt: now }).catch(() => null);
      return { id, guildId, userId, createdAt: now };
    },

    async getBan(guildId: string, userId: string) {
      return db.select().from(bans).where(and(eq(bans.guildId, guildId), eq(bans.userId, userId), isNull(bans.expiresAt))).limit(1).then((r) => r[0] || null);
    },

    async removeBan(guildId: string, userId: string) {
      return db.delete(bans).where(and(eq(bans.guildId, guildId), eq(bans.userId, userId))).catch(() => ({ changes: 0 }));
    },

    // === Audit Logs ===
    async createAudit(guildId: string | null, action: string, actorId: string | null, targetId?: string | null, resourceType?: string | null, resourceId?: string | null, payload?: string | null, status?: string, errorMessage?: string | null) {
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.insert(auditLogs).values({ id, guildId: guildId || null, action, actorId: actorId || null, targetId: targetId || null, resourceType: resourceType || null, resourceId: resourceId || null, payload: payload || null, status: status || 'SUCCESS', errorMessage: errorMessage || null, createdAt: now }).catch(() => null);
      return { id, createdAt: now };
    },

    async getAuditsByGuild(guildId: string, limit = 50) {
      return db.select().from(auditLogs).where(eq(auditLogs.guildId, guildId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
    },

    // === Feature Flags ===
    async getFeatureFlag(key: string) {
      return db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1).then((r) => r[0] || null);
    },

    async setFeatureFlag(key: string, enabled: boolean) {
      const existing = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
      if (existing.length > 0) {
        const now = new Date().toISOString();
        await db.update(featureFlags).set({ enabled, updatedAt: now }).where(eq(featureFlags.key, key)).catch(() => null);
        return { ...existing[0], enabled };
      }
      const id = randomUUID();
      const now = new Date().toISOString();
      const record = { id, key, enabled, createdAt: now, updatedAt: now };
      await db.insert(featureFlags).values(record).catch(() => null);
      return record;
    },

    // === State (cache clave-valor transversal) ===
    async getState(key: string) {
      return db.select().from(state).where(eq(state.key, key)).limit(1).then((r) => r[0] || null);
    },

    async setState(key: string, value: string, expiresAt?: Date) {
      const existing = await db.select().from(state).where(eq(state.key, key)).limit(1);
      if (existing.length > 0) {
        const now = new Date().toISOString();
        await db.update(state).set({ value, expiresAt: expiresAt?.toISOString() || null, updatedAt: now }).where(eq(state.key, key)).catch(() => null);
        return { ...existing[0], value, expiresAt };
      }
      const id = randomUUID();
      const now = new Date().toISOString();
      const record = { id, key, value, expiresAt: expiresAt?.toISOString() || null, createdAt: now, updatedAt: now };
      await db.insert(state).values(record).catch(() => null);
      return record;
    },

    async deleteState(key: string) {
      return db.delete(state).where(eq(state.key, key)).catch(() => ({ changes: 0 }));
    },

    // === Cleanup ===
    async cleanupExpiredBans() {
      return db.delete(bans).where(sql`${bans.expiresAt} IS NOT NULL AND ${bans.expiresAt} < datetime('now')`).catch(() => ({ changes: 0 }));
    },

    async cleanupExpiredState() {
      return db.delete(state).where(sql`${state.expiresAt} IS NOT NULL AND ${state.expiresAt} < datetime('now')`).catch(() => ({ changes: 0 }));
    },
  };
}

