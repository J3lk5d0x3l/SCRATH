import logger from './logger.js';

export function createFeatureFlagService(repositories: any, log: typeof logger, config: any) {
  const cache = new Map<string, { value: boolean; expiresAt: number }>();

  return {
    async isEnabled(key: string, guildId?: string): Promise<boolean> {
      // Verificar override por guild primero
      if (guildId) {
        const overrideKey = `${key}:${guildId}`;
        const cached = cache.get(overrideKey);
        if (cached && cached.expiresAt > Date.now()) {
          return cached.value;
        }

        // En Drizzle esto se haría con una tabla separada de overrides
        // Por ahora, returna la configuración global
      }

      // Verificar cache global
      const cacheKey = `flag:${key}`;
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }

      try {
        const flag = await repositories.getFeatureFlag(key);
        const enabled = flag?.enabled || false;

        // Cachea por TTL
        cache.set(cacheKey, {
          value: enabled,
          expiresAt: Date.now() + (config.featureFlagsCacheTTL || 300000),
        });

        return enabled;
      } catch (error) {
        log.error({ err: error, key }, 'Error consultando feature flag');
        return false;
      }
    },

    async setEnabled(key: string, enabled: boolean): Promise<void> {
      try {
        await repositories.setFeatureFlag(key, enabled);
        cache.delete(`flag:${key}`);
        log.debug({ key, enabled }, 'Feature flag actualizado');
      } catch (error) {
        log.error({ err: error, key }, 'Error actualizando feature flag');
      }
    },

    invalidateCache(key?: string): void {
      if (key) {
        cache.delete(`flag:${key}`);
      } else {
        cache.clear();
      }
    },
  };
}
