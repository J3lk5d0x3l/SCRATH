// src/systems/GuildSystem.js
// Sistema de Guild: casos de uso relacionados con servidores

/**
 * Crear GuildSystem
 */
export function createGuildSystem(repositories, logger) {
  return {
    /**
     * Obtiene o crea guild por Discord ID
     */
    async getOrCreateGuild(discordId, guildData) {
      try {
        const guild = await repositories.guilds.upsert(discordId, {
          id: discordId,
          name: guildData.name || 'Unknown Guild',
          icon: guildData.icon,
          memberCount: guildData.memberCount || 0,
        });

        // Asegura que existe GuildSettings
        await repositories.guildSettings.upsert(guild.id, {});

        logger.debug({ guildId: guild.id }, 'Guild obtenido/creado');
        return guild;
      } catch (error) {
        logger.error({ err: error, discordId }, 'Error en getOrCreateGuild');
        throw error;
      }
    },

    /**
     * Obtiene datos de guild con settings y stats
     */
    async getGuildInfo(guildId) {
      try {
        const guild = await repositories.guilds.findById(guildId);
        if (!guild) {
          return null;
        }

        const settings = await repositories.guildSettings.findByGuildId(guildId);
        const auditLogs = await repositories.audit.findByGuild(guildId, 10);

        return {
          id: guild.id,
          discordId: guild.discordId,
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount,
          createdAt: guild.createdAt,
          settings: {
            prefix: settings?.prefix || '!',
            language: settings?.language || 'es',
            loggingEnabled: settings?.loggingEnabled || true,
          },
          auditLogCount: auditLogs.length,
          lastAuditLog: auditLogs[0]?.createdAt || null,
        };
      } catch (error) {
        logger.error({ err: error, guildId }, 'Error en getGuildInfo');
        throw error;
      }
    },

    /**
     * Obtiene settings de guild
     */
    async getGuildSettings(guildId) {
      try {
        return await repositories.guildSettings.findByGuildId(guildId);
      } catch (error) {
          logger.error({ err: error, guildId }, 'Error en getGuildSettings');
          return null;
        }
    },

    /**
     * Actualiza settings de guild
     */
    async updateGuildSettings(guildId, settings) {
      try {
        const updated = await repositories.guildSettings.update(guildId, settings);
        logger.info({ guildId, settings }, 'Guild settings actualizados');
        return updated;
      } catch (error) {
          logger.error({ err: error, guildId }, 'Error actualizando guild settings');
          throw error;
        }
    },

    /**
     * Obtiene guild por Discord ID
     */
    async getGuild(discordId) {
      try {
        return await repositories.guilds.findByDiscordId(discordId);
      } catch (error) {
          logger.error({ err: error, discordId }, 'Error en getGuild');
          return null;
        }
    },
  };
}
