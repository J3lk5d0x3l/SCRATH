// src/services/health.js
// Health check service for monitoring

import os from 'os';

let clientReference = null;

/**
 * Initialize health service with Discord client reference
 * @param {Client} client Discord client
 */
export function initializeHealth(client) {
  clientReference = client;
}

/**
 * Get detailed health status of the bot
 * @returns {Promise<Object>} Health status object
 */
export async function getHealthStatus() {
  if (!clientReference) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      reason: 'Client not initialized',
    };
  }

  const isReady = clientReference.isReady();
  const uptime = clientReference.uptime;
  const latency = clientReference.ws.ping;
  const guilds = clientReference.guilds.cache.size;
  const users = clientReference.users.cache.size;

  // Memory usage
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  // CPU usage (simulated)
  const cpus = os.cpus();
  const cpuCount = cpus.length;

  // Determine overall health
  const isHealthy =
    isReady &&
    latency < 500 && // Latency must be < 500ms
    heapUsedPercent < 90; // Heap usage < 90%

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    bot: {
      ready: isReady,
      uptime,
      latency,
      guilds,
      users,
    },
    system: {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsedPercent: Math.round(heapUsedPercent * 100) / 100,
      },
      cpu: {
        cores: cpuCount,
      },
    },
    checks: {
      discord_connected: isReady,
      latency_ok: latency < 500,
      memory_ok: heapUsedPercent < 90,
    },
  };
}

/**
 * Get simplified health status (for load balancers)
 * @returns {Object} Simple status
 */
export async function getSimpleHealth() {
  const health = await getHealthStatus();
  return {
    status: health.status,
    ready: health.bot.ready,
    timestamp: health.timestamp,
  };
}

export default {
  initializeHealth,
  getHealthStatus,
  getSimpleHealth,
};
