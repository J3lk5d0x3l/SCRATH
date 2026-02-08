/**
 * AutoModDomain: Lógica pura de moderación automática
 */

export function checkSpam(messageCount: number, windowMs: number, maxMessages: number): boolean {
  return messageCount > maxMessages;
}

export function checkMentionSpam(mentionCount: number, maxMentions = 5): boolean {
  return mentionCount > maxMentions;
}

export function shouldMute(violations: number): boolean {
  return violations >= 3;
}
