// src/systems/ConfigSystem.js
// Sistema de Configuración: casos de uso para settings

import * as ConfigDomain from '../domains/ConfigDomain.js';

/**
 * Crear ConfigSystem
 */
export function createConfigSystem(repositories, logger) {
  return {
    /**
     * Obtiene configuración de guild
     */
    async getConfig(guildId) {
      try {
        let settings = await repositories.guildSettings.findByGuildId(guildId);
        if (!settings) {
          settings = await repositories.guildSettings.upsert(guildId, {});
        }
        logger.debug({ guildId }, 'Config obtenida');
        return settings;
      } catch (error) {
          logger.error({ err: error, guildId }, 'Error obteniendo config');
        throw error;
      }
    },

    /**
     * Actualiza configuración (valida antes)
     */
    async updateConfig(guildId, updates) {
      try {
        // Valida cambios
        const validated = ConfigDomain.createValidSettings(updates);

        const updated = await repositories.guildSettings.update(guildId, validated);
        logger.info({ guildId, updates: validated }, 'Config actualizada');

        return updated;
      } catch (error) {
          logger.error({ err: error, guildId }, 'Error actualizando config');
        throw error;
      }
    },

    /**
     * Resetea config a defaults
     */
    async resetConfig(guildId) {
      try {
        const defaults = {
          prefix: '!',
          language: 'es',
          loggingEnabled: true,
        };

        const updated = await repositories.guildSettings.update(guildId, defaults);
        logger.info({ guildId }, 'Config reseteada a defaults');

        return updated;
      } catch (error) {
          logger.error({ err: error, guildId }, 'Error reseteando config');
        throw error;
      }
    },
  };
}
