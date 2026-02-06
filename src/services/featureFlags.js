// src/services/featureFlags.js
// Servicio de Feature Flags: toggle de funcionalidades sin deploy

/**
 * Crear servicio de feature flags
 */
export function createFeatureFlagService(flagRepository, logger, config) {
  const cache = new Map(); // Simple in-memory cache
  const cacheExpiry = new Map();

  function isCacheValid(flagName) {
    const expiry = cacheExpiry.get(flagName);
    return expiry && expiry > Date.now();
  }

  function setCacheExpiry(flagName) {
    cacheExpiry.set(flagName, Date.now() + config.featureFlagsCacheTTL);
  }

  return {
    /**
     * Verifica si un flag está habilitado
     * @param {string} flagName - Nombre del flag
     * @param {string?} guildId - Guild específico (null = global)
     */
    async isEnabled(flagName, guildId = null) {
      const cacheKey = `${flagName}:${guildId || 'global'}`;

      // Intenta caché
      if (cache.has(cacheKey) && isCacheValid(flagName)) {
        logger.debug({ flagName, guildId }, 'Flag obtenido de caché');
        return cache.get(cacheKey);
      }

      // BD
      try {
        const flag = await flagRepository.findByName(flagName, guildId);
        const enabled = flag ? flag.enabled : false;

        // Verifica expiración
        if (flag && flag.expiresAt && flag.expiresAt < new Date()) {
          await flagRepository.delete(flagName, guildId);
          cache.set(cacheKey, false);
          logger.debug({ flagName, guildId }, 'Flag expirado, deshabilitado');
          return false;
        }

        // Cachea
        cache.set(cacheKey, enabled);
        setCacheExpiry(flagName);

        return enabled;
      } catch (error) {
          logger.error({ err: error, flagName, guildId }, 'Error verificando feature flag');
        return false; // Falla segura
      }
    },

    /**
     * Establece un flag
     */
    async setFlag(flagName, enabled, value = null, guildId = null, expiresAt = null) {
      try {
        const cacheKey = `${flagName}:${guildId || 'global'}`;
        const flag = await flagRepository.set(flagName, enabled, value, guildId, expiresAt);

        // Invalida caché
        cache.set(cacheKey, enabled);
        setCacheExpiry(flagName);

        logger.info(
          { flagName, enabled, guildId },
          'Feature flag actualizado'
        );

        return flag;
      } catch (error) {
          logger.error({ err: error, flagName }, 'Error estableciendo feature flag');
        throw error;
      }
    },

    /**
     * Obtiene valor completo del flag
     */
    async getFlag(flagName, guildId = null) {
      try {
        const flag = await flagRepository.findByName(flagName, guildId);
        if (flag && flag.expiresAt && flag.expiresAt < new Date()) {
          await flagRepository.delete(flagName, guildId);
          return null;
        }
        return flag;
      } catch (error) {
          logger.error({ err: error, flagName }, 'Error obteniendo flag');
        return null;
      }
    },

    /**
     * Limpia flags expirados
     */
    async cleanupExpired() {
      try {
        const deleted = await flagRepository.cleanupExpired();
        cache.clear();
        logger.info(
          { deletedCount: deleted.count },
          'Flags expirados eliminados'
        );
        return deleted;
      } catch (error) {
          logger.error({ err: error }, 'Error limpiando flags expirados');
      }
    },

    /**
     * Invalida caché (p.ej., después de update manual)
     */
    invalidateCache(flagName = null) {
      if (flagName) {
        const keys = Array.from(cache.keys()).filter(k => k.startsWith(flagName));
        keys.forEach(k => cache.delete(k));
      } else {
        cache.clear();
      }
    },
  };
}
