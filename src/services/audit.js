// src/services/audit.js
// Servicio de Auditoría: registra acciones sensibles

/**
 * Crear servicio de auditoría
 */
export function createAuditService(repositories, logger) {
  return {
    /**
     * Registra una acción en auditoría
     * @param {Object} data - { guildId?, userId?, action, resourceType?, resourceId?, details?, ipAddress?, userAgent?, status, errorMessage? }
     */
    async log(data) {
      try {
        // Asegura que las entidades referenciadas existen en la BD (evita FK violations)
        let guildInternalId = null;
        let userInternalId = null;

        if (data.guildId) {
          // data.guildId viene como Discord ID; upsert crea la guild con id igual al discordId
          const guild = await repositories.guilds.upsert(data.guildId, {
            id: data.guildId,
            name: data.guildId,
          });
          guildInternalId = guild.id;
        }

        if (data.userId) {
          const user = await repositories.users.upsert(data.userId, {
            id: data.userId,
            username: 'Unknown',
          });
          userInternalId = user.id;
        }

        const auditRecord = await repositories.audit.log({
          guildId: guildInternalId,
          userId: userInternalId,
          action: data.action,
          resourceType: data.resourceType || null,
          resourceId: data.resourceId || null,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          status: data.status || 'SUCCESS',
          errorMessage: data.errorMessage || null,
        });

          logger.debug(
            {
              auditId: auditRecord.id,
              guildId: auditRecord.guildId,
              userId: auditRecord.userId,
              action: auditRecord.action,
            },
            'Acción auditada'
          );

          return auditRecord;
        } catch (error) {
          logger.error({ err: error, action: data.action }, 'Error registrando auditoría');
          // Fail-safe: no relanzar error para no tumbar el flujo de interacción
          return null;
        }
    },

    /**
     * Obtiene auditoría por guild
     */
    async getGuildLogs(guildId, limit = 50) {
      try {
        return await repositories.audit.findByGuild(guildId, limit);
      } catch (error) {
        logger.error({ err: error, guildId }, 'Error obteniendo logs de guild');
        return [];
      }
    },

    /**
     * Obtiene auditoría por usuario
     */
    async getUserLogs(userId, limit = 50) {
      try {
        return await repositories.audit.findByUser(userId, limit);
      } catch (error) {
        logger.error({ err: error, userId }, 'Error obteniendo logs de usuario');
        return [];
      }
    },

    /**
     * Limpia auditoría antigua
     */
    async cleanup(retentionDays) {
      try {
        const deleted = await repositories.audit.cleanup(retentionDays);
        logger.info({ deletedCount: deleted.count, retentionDays }, 'Auditoría antigua eliminada');
        return deleted;
      } catch (error) {
        logger.error({ err: error }, 'Error limpiando auditoría');
        return { count: 0 };
      }
    },
  };
}
