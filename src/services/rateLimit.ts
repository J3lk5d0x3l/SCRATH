export function createRateLimitService(logger: any, config: any) {
  const buckets = new Map<string, { count: number; resetTime: number }>();

  function generateKey(type: string, identifier: string) {
    return `${type}:${identifier}`;
  }

  function cleanup() {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetTime < now) {
        buckets.delete(key);
      }
    }
  }

  return {
    check(params: { type: string; identifier: string; limit?: number; windowMs?: number }) {
      cleanup();

      const { type, identifier, limit = 60, windowMs = 60000 } = params;
      const key = generateKey(type, identifier);
      const now = Date.now();

      let bucket = buckets.get(key);

      if (!bucket || bucket.resetTime < now) {
        bucket = { count: 0, resetTime: now + windowMs };
        buckets.set(key, bucket);
      }

      bucket.count++;
      const allowed = bucket.count <= limit;
      const remaining = Math.max(0, limit - bucket.count);

      if (!allowed) {
        logger.warn({ type, identifier, limit, count: bucket.count }, 'Rate limit excedido');
      }

      return { allowed, remaining, resetTime: bucket.resetTime };
    },

    checkGlobal() {
      return this.check({ type: 'global', identifier: 'all', limit: config.rateLimitGlobalPerMinute, windowMs: 60000 });
    },

    checkGuild(guildId: string) {
      return this.check({ type: 'guild', identifier: guildId, limit: config.rateLimitGuildPerMinute, windowMs: 60000 });
    },

    checkUser(userId: string) {
      return this.check({ type: 'user', identifier: userId, limit: config.rateLimitUserPerMinute, windowMs: 60000 });
    },

    checkCommand(commandName: string, userId: string) {
      return this.check({ type: 'command', identifier: `${commandName}:${userId}`, limit: 1, windowMs: config.rateLimitCommandCooldownSeconds * 1000 });
    },

    reset(type: string, identifier: string) {
      const key = generateKey(type, identifier);
      buckets.delete(key);
      logger.debug({ type, identifier }, 'Rate limit reseteado');
    },

    getStatus(type: string, identifier: string) {
      const key = generateKey(type, identifier);
      const bucket = buckets.get(key);
      return bucket || null;
    },

    getStats() {
      return { bucketsActive: buckets.size, totalBuckets: buckets.size };
    },
  };
}
