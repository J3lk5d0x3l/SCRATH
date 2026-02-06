// src/systems/UserSystem.js
// Sistema de Usuario: casos de uso relacionados con usuarios

/**
 * Crear UserSystem
 */
export function createUserSystem(repositories, logger) {
  return {
    /**
     * Obtiene o crea usuario por Discord ID
     */
    async getOrCreateUser(discordId, userData) {
      try {
        const user = await repositories.users.upsert(discordId, {
          id: discordId,
          username: userData.username || 'Unknown',
          discriminator: userData.discriminator,
          avatar: userData.avatar,
        });

        logger.debug({ userId: user.id }, 'Usuario obtenido/creado');
        return user;
      } catch (error) {
        logger.error({ err: error, discordId }, 'Error en getOrCreateUser');
        throw error;
      }
    },

    /**
     * Obtiene datos del usuario con stats
     */
    async getUserStats(userId) {
      try {
        const user = await repositories.users.findById(userId);
        if (!user) {
          return null;
        }

        // Obtiene auditoría del usuario (últimas 10 acciones)
        const auditLogs = await repositories.audit.findByUser(userId, 10);

        return {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          actionCount: auditLogs.length,
          lastAction: auditLogs[0]?.createdAt || null,
        };
      } catch (error) {
        logger.error({ err: error, userId }, 'Error en getUserStats');
        throw error;
      }
    },

    /**
     * Obtiene usuario por Discord ID
     */
    async getUser(discordId) {
      try {
        return await repositories.users.findByDiscordId(discordId);
      } catch (error) {
        logger.error({ err: error, discordId }, 'Error en getUser');
        return null;
      }
    },
  };
}
