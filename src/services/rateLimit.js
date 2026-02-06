// src/services/rateLimit.js
// Servicio de Rate Limiting: multinivel (global, guild, user, command)

/**
 * Crear servicio de rate limiting
 */
export function createRateLimitService(logger, config) {
  // Almacena: "key" -> { count, resetTime }
  const buckets = new Map();

  /**
   * Genera clave de bucket
   */
  function generateKey(type, identifier) {
    return `${type}:${identifier}`;
  }

  /**
   * Limpia buckets expirados
   */
  function cleanup() {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetTime < now) {
        buckets.delete(key);
      }
    }
  }

  return {
    /**
     * Valida rate limit
     * @param {Object} params - { type: 'global'|'guild'|'user'|'command', identifier, limit?, windowMs? }
     * @returns { allowed: boolean, remaining: number, resetTime: number }
     */
    check(params) {
      cleanup();

      const { type, identifier, limit = 60, windowMs = 60000 } = params;
      const key = generateKey(type, identifier);
      const now = Date.now();

      let bucket = buckets.get(key);

      // Crea bucket si no existe o expiró
      if (!bucket || bucket.resetTime < now) {
        bucket = { count: 0, resetTime: now + windowMs };
        buckets.set(key, bucket);
      }

      bucket.count++;
      const allowed = bucket.count <= limit;
      const remaining = Math.max(0, limit - bucket.count);

      if (!allowed) {
        logger.warn(
          { type, identifier, limit, count: bucket.count },
          'Rate limit excedido'
        );
      }

      return {
        allowed,
        remaining,
        resetTime: bucket.resetTime,
      };
    },

    /**
     * Valida rate limit global
     */
    checkGlobal() {
      return this.check({
        type: 'global',
        identifier: 'all',
        limit: config.rateLimitGlobalPerMinute,
        windowMs: 60000,
      });
    },

    /**
     * Valida rate limit por guild
     */
    checkGuild(guildId) {
      return this.check({
        type: 'guild',
        identifier: guildId,
        limit: config.rateLimitGuildPerMinute,
        windowMs: 60000,
      });
    },

    /**
     * Valida rate limit por usuario
     */
    checkUser(userId) {
      return this.check({
        type: 'user',
        identifier: userId,
        limit: config.rateLimitUserPerMinute,
        windowMs: 60000,
      });
    },

    /**
     * Valida cooldown de comando
     */
    checkCommand(commandName, userId) {
      return this.check({
        type: 'command',
        identifier: `${commandName}:${userId}`,
        limit: 1,
        windowMs: config.rateLimitCommandCooldownSeconds * 1000,
      });
    },

    /**
     * Resetea bucket específico
     */
    reset(type, identifier) {
      const key = generateKey(type, identifier);
      buckets.delete(key);
      logger.debug({ type, identifier }, 'Rate limit reseteado');
    },

    /**
     * Obtiene estado de bucket
     */
    getStatus(type, identifier) {
      const key = generateKey(type, identifier);
      const bucket = buckets.get(key);
      return bucket || null;
    },

    /**
     * Obtiene estadísticas
     */
    getStats() {
      return {
        bucketsActive: buckets.size,
        totalBuckets: buckets.size,
      };
    },
  };
}
