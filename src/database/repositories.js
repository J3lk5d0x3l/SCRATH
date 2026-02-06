// src/database/repositories.js
// Repositorios: acceso a datos sin lógica de negocio

/**
 * Repositorio de Usuarios
 */
class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByDiscordId(discordId) {
    return this.prisma.user.findUnique({ where: { discordId } });
  }

  async upsert(discordId, userData) {
    return this.prisma.user.upsert({
      where: { discordId },
      update: userData,
      create: { discordId, ...userData },
    });
  }

  async delete(id) {
    return this.prisma.user.delete({ where: { id } });
  }
}

/**
 * Repositorio de Guilds
 */
class GuildRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.guild.findUnique({ where: { id } });
  }

  async findByDiscordId(discordId) {
    return this.prisma.guild.findUnique({ where: { discordId } });
  }

  async upsert(discordId, guildData) {
    return this.prisma.guild.upsert({
      where: { discordId },
      update: guildData,
      create: { discordId, ...guildData },
    });
  }

  async delete(id) {
    return this.prisma.guild.delete({ where: { id } });
  }

  async list(limit = 100, offset = 0) {
    return this.prisma.guild.findMany({ take: limit, skip: offset });
  }
}

/**
 * Repositorio de Guild Settings
 */
class GuildSettingsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByGuildId(guildId) {
    return this.prisma.guildSettings.findUnique({ where: { guildId } });
  }

  async upsert(guildId, settings) {
    return this.prisma.guildSettings.upsert({
      where: { guildId },
      update: settings,
      create: { guildId, ...settings },
    });
  }

  async update(guildId, settings) {
    return this.prisma.guildSettings.update({
      where: { guildId },
      data: settings,
    });
  }
}

/**
 * Repositorio de Auditoría
 */
class AuditRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async log(auditData) {
    return this.prisma.auditLog.create({ data: auditData });
  }

  async findByGuild(guildId, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { guildId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async cleanup(retentionDays) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
  }
}

/**
 * Repositorio de Feature Flags
 */
class FeatureFlagRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByName(name, guildId = null) {
    return this.prisma.featureFlag.findFirst({
      where: { name, guildId },
    });
  }

  async findAll(guildId = null) {
    return this.prisma.featureFlag.findMany({
      where: { guildId },
    });
  }

  async set(name, enabled, value = null, guildId = null, expiresAt = null) {
    return this.prisma.featureFlag.upsert({
      where: { name_guildId: { name, guildId } },
      update: { enabled, value, expiresAt },
      create: { name, enabled, value, guildId, expiresAt },
    });
  }

  async delete(name, guildId = null) {
    return this.prisma.featureFlag.deleteMany({
      where: { name, guildId },
    });
  }

  async cleanupExpired() {
    return this.prisma.featureFlag.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

/**
 * Repositorio de Advertencias
 */
class WarningRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(guildId, userId, reason, moderatorId = null, expiresAt = null) {
    return this.prisma.warning.create({
      data: {
        guildId,
        userId,
        reason,
        moderatorId,
        expiresAt,
      },
    });
  }

  async findByUserId(userId, guildId, limit = 50) {
    return this.prisma.warning.findMany({
      where: { userId, guildId, active: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countActiveByUser(userId, guildId) {
    return this.prisma.warning.count({
      where: { userId, guildId, active: true },
    });
  }

  async deactivate(warningId) {
    return this.prisma.warning.update({
      where: { id: warningId },
      data: { active: false },
    });
  }

  async cleanupExpired() {
    return this.prisma.warning.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        active: true,
      },
      data: { active: false },
    });
  }
}

/**
 * Repositorio de Bans
 */
class BanRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(guildId, userId, reason, moderatorId = null, expiresAt = null) {
    return this.prisma.ban.create({
      data: {
        guildId,
        userId,
        reason,
        moderatorId,
        expiresAt,
      },
    });
  }

  async findActive(guildId, userId) {
    return this.prisma.ban.findFirst({
      where: { guildId, userId, active: true },
    });
  }

  async findByGuild(guildId, limit = 50) {
    return this.prisma.ban.findMany({
      where: { guildId, active: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async deactivate(banId) {
    return this.prisma.ban.update({
      where: { id: banId },
      data: { active: false },
    });
  }

  async deactivateByUserId(guildId, userId) {
    return this.prisma.ban.updateMany({
      where: { guildId, userId, active: true },
      data: { active: false },
    });
  }

  async cleanupExpired() {
    return this.prisma.ban.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        active: true,
      },
      data: { active: false },
    });
  }
}

/**
 * Crea instancias de todos los repositorios
 */
export function createRepositories(prisma, logger) {
  return {
    users: new UserRepository(prisma),
    guilds: new GuildRepository(prisma),
    guildSettings: new GuildSettingsRepository(prisma),
    audit: new AuditRepository(prisma),
    featureFlags: new FeatureFlagRepository(prisma),
    warnings: new WarningRepository(prisma),
    bans: new BanRepository(prisma),
  };
}
