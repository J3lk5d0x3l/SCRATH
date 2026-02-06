// src/systems/StatisticsSystem.js
// Sistema de Estadísticas: recopila métricas del bot

/**
 * Crear StatisticsSystem
 */
export function createStatisticsSystem(repositories, logger, client) {
  return {
    /**
     * Obtiene estadísticas globales del bot
     */
    async getBotStats() {
      try {
        const guilds = await repositories.guilds.list(1000, 0);
        const users = await repositories.users.findMany ? 
          (await repositories.users.findMany({ take: 1000 })) : [];
        
        const guildCount = guilds.length;
        const userCount = users.length;
        const totalMembers = guilds.reduce((sum, g) => sum + (g.memberCount || 0), 0);

        logger.debug(
          { guildCount, userCount, totalMembers },
          'Bot stats recopilados'
        );

        return {
          guildCount,
          userCount,
          totalMembers,
          uptime: client?.uptime || 0,
          botPing: client?.ws?.ping || 0,
        };
      } catch (error) {
        logger.error({ err: error }, 'Error obteniendo bot stats');
        throw error;
      }
    },

    /**
     * Obtiene estadísticas de un guild
     */
    async getGuildStats(guildId) {
      try {
        const guild = await repositories.guilds.findById(guildId);
        if (!guild) {
          return null;
        }

        const members = await repositories.guilds.findMembers ? 
          (await repositories.guilds.findMembers(guildId)) : [];
        
        const warnings = await repositories.warnings.findByUserId ? 
          (await repositories.warnings.findByUserId('', guildId)) : [];
        
        const bans = await repositories.bans.findByGuild(guildId, 100);
        const auditLogs = await repositories.audit.findByGuild(guildId, 100);

        return {
          id: guild.id,
          name: guild.name,
          memberCount: guild.memberCount,
          warningCount: warnings?.length || 0,
          banCount: bans.length,
          auditLogCount: auditLogs.length,
          createdAt: guild.createdAt,
        };
      } catch (error) {
        logger.error({ err: error, guildId }, 'Error obteniendo guild stats');
        return null;
      }
    },

    /**
     * Obtiene estadísticas de un usuario
     */
    async getUserStats(guildId, userId) {
      try {
        const warnings = await repositories.warnings.findByUserId(userId, guildId, 100);
        const ban = await repositories.bans.findActive(guildId, userId);
        const auditLogs = await repositories.audit.findByUser(userId, 50);

        return {
          userId,
          warningCount: warnings.length,
          isBanned: ban ? true : false,
          banExpires: ban?.expiresAt || null,
          lastAction: auditLogs[0]?.createdAt || null,
        };
      } catch (error) {
        logger.error({ err: error, userId, guildId }, 'Error obteniendo user stats');
        return null;
      }
    },

    /**
     * Obtiene estadísticas de moderación del guild
     */
    async getModerationStats(guildId) {
      try {
        const warnings = await repositories.warnings.findByGuildId ? 
          (await repositories.warnings.findByGuildId(guildId)) : [];
        
        const bans = await repositories.bans.findByGuild(guildId, 1000);
        const auditLogs = await repositories.audit.findByGuild(guildId, 500);

        const moderationActions = auditLogs.filter(log =>
          ['USER_WARNED', 'USER_MUTED', 'USER_BANNED', 'USER_UNMUTED'].includes(log.action)
        );

        return {
          totalWarnings: warnings?.length || 0,
          totalBans: bans.length,
          totalModerationActions: moderationActions.length,
          recentActions: moderationActions.slice(0, 5),
        };
      } catch (error) {
        logger.error({ err: error, guildId }, 'Error obteniendo moderation stats');
        return null;
      }
    },
  };
}
