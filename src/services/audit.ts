export function createAuditService(repositories: any, logger: any) {
  return {
    async log(data: any) {
      try {
        const guildId = data.guildId || null;
        const actorId = data.userId || null;
        const payload = data.details ? JSON.stringify(data.details) : null;
        const record = await repositories.createAudit(guildId, data.action, actorId, payload);

        logger.debug({ auditId: record.id, guildId, actorId, action: data.action }, 'Acción auditada');
        return record;
      } catch (error) {
        logger.error({ err: error, action: data.action }, 'Error registrando auditoría');
        return null;
      }
    },

    async getGuildLogs(guildId: string, limit = 50) {
      try {
        // repositorio limitado: no implementado filtro en esta versión mínima
        return [];
      } catch (error) {
        logger.error({ err: error, guildId }, 'Error obteniendo logs de guild');
        return [];
      }
    },
  };
}
