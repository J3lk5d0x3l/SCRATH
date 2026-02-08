export function createBackpressureService() {
  const maxGlobal = parseInt(process.env.BP_MAX_GLOBAL || '50', 10);
  const maxGuild = parseInt(process.env.BP_MAX_GUILD || '10', 10);
  const maxUser = parseInt(process.env.BP_MAX_USER || '3', 10);

  let globalCount = 0;
  const guildCounts = new Map<string, number>();
  const userCounts = new Map<string, number>();

  function tryAcquire(guildId?: string, userId?: string) {
    if (globalCount >= maxGlobal) return false;
    if (guildId && (guildCounts.get(guildId) || 0) >= maxGuild) return false;
    if (userId && (userCounts.get(userId) || 0) >= maxUser) return false;

    globalCount++;
    if (guildId) guildCounts.set(guildId, (guildCounts.get(guildId) || 0) + 1);
    if (userId) userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
    return true;
  }

  function release(guildId?: string, userId?: string) {
    globalCount = Math.max(0, globalCount - 1);
    if (guildId) guildCounts.set(guildId, Math.max(0, (guildCounts.get(guildId) || 1) - 1));
    if (userId) userCounts.set(userId, Math.max(0, (userCounts.get(userId) || 1) - 1));
  }

  return { tryAcquire, release };
}
