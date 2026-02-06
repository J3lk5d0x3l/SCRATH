// src/core/config.js
// Configuración centralizada: env variables + defaults

const config = {
  // Discord
  discordToken: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID || null, // Para registrar comandos en un guild específico en desarrollo
  shardCount: parseInt(process.env.SHARD_COUNT || '1', 10),
  shardList: process.env.SHARD_LIST ? process.env.SHARD_LIST.split(',').map(Number) : [0],
  environment: process.env.ENVIRONMENT || 'development',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./prisma/bot.db',

  // Features
  featureFlagsCacheTTL: parseInt(process.env.FEATURE_FLAGS_CACHE_TTL || '300000', 10),

  // Rate Limiting
  rateLimitGlobalPerMinute: parseInt(process.env.RATE_LIMIT_GLOBAL_PER_MINUTE || '120', 10),
  rateLimitGuildPerMinute: parseInt(process.env.RATE_LIMIT_GUILD_PER_MINUTE || '60', 10),
  rateLimitUserPerMinute: parseInt(process.env.RATE_LIMIT_USER_PER_MINUTE || '30', 10),
  rateLimitCommandCooldownSeconds: parseInt(process.env.RATE_LIMIT_COMMAND_COOLDOWN_SECONDS || '3', 10),

  // Audit
  auditEnabled: process.env.AUDIT_ENABLED === 'true',
  auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90', 10),

  // PM2
  pm2Namespace: process.env.PM2_NAMESPACE || 'discord-bot',
};

/**
 * Valida configuración crítica
 */
export function validateConfig() {
  const critical = ['discordToken'];
  const missing = critical.filter(key => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Configuración faltante: ${missing.join(', ')}. Revisa .env`);
  }
}

export default config;
