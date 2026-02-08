/**
 * ModerationDomain: Lógica pura de moderación
 */

export interface ModerationAction {
  type: 'ban' | 'kick' | 'mute' | 'warn';
  userId: string;
  guildId: string;
  moderatorId: string;
  reason?: string;
  duration?: number;
}

export function canExecuteAction(actorLevel: number, targetLevel: number): boolean {
  return actorLevel > targetLevel;
}

export function getWarnThreshold(maxWarnings = 3): number {
  return maxWarnings;
}

export function shouldAutoBan(warningCount: number, maxWarnings = 3): boolean {
  return warningCount >= maxWarnings;
}
