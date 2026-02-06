// src/domains/AutoModDomain.js
// Auto-moderation rules validation

/**
 * Validate automod trigger type
 * @param {string} trigger Trigger type
 * @returns {boolean} Is valid
 */
export function validateTrigger(trigger) {
  const validTriggers = ['spam', 'profanity', 'invites', 'mentions', 'caps'];
  return validTriggers.includes(trigger?.toLowerCase?.());
}

/**
 * Validate automod action
 * @param {string} action Action type
 * @returns {boolean} Is valid
 */
export function validateAction(action) {
  const validActions = ['warn', 'mute', 'kick', 'delete'];
  return validActions.includes(action?.toLowerCase?.());
}

/**
 * Validate threshold (how many triggers before action)
 * @param {number} threshold Threshold value
 * @returns {boolean} Is valid
 */
export function validateThreshold(threshold) {
  const num = parseInt(threshold, 10);
  return !isNaN(num) && num >= 1 && num <= 100;
}

/**
 * Validate duration in seconds
 * @param {number} duration Duration
 * @returns {boolean} Is valid
 */
export function validateDuration(duration) {
  const num = parseInt(duration, 10);
  return !isNaN(num) && num >= 0;
}

/**
 * Check if message should be flagged for spam
 * @param {string} content Message content
 * @param {number} previousMessages Count of recent messages
 * @param {number} threshold Threshold messages
 * @returns {boolean} Should flag
 */
export function isSpam(content, previousMessages, threshold = 5) {
  // Multiple rapid messages = spam
  if (previousMessages >= threshold) {
    return true;
  }
  // Message with excessive caps (>50%)
  if (content && content.length > 10) {
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    return capsCount / content.length > 0.5;
  }
  return false;
}

/**
 * Check if message contains invitation
 * @param {string} content Message content
 * @returns {boolean} Contains invitation
 */
export function hasInvitation(content) {
  // Discord invite patterns: discord.gg/xxxxx or discord.com/invite/xxxxx
  const inviteRegex = /discord\.(?:gg|com\/invite)\/[\w-]+/gi;
  return inviteRegex.test(content);
}

/**
 * Check if message mentions too many users
 * @param {number} mentionCount Count of mentions
 * @param {number} threshold Threshold
 * @returns {boolean} Exceeds threshold
 */
export function excessiveMentions(mentionCount, threshold = 5) {
  return mentionCount > threshold;
}

/**
 * Create valid automod config
 * @param {Object} data Config data
 * @returns {Object|null} Valid config or null
 */
export function createValidAutoModConfig(data) {
  if (!validateTrigger(data.trigger) || !validateAction(data.action)) {
    return null;
  }

  const threshold = parseInt(data.threshold, 10) || 1;
  if (!validateThreshold(threshold)) {
    return null;
  }

  return {
    trigger: data.trigger.toLowerCase(),
    action: data.action.toLowerCase(),
    threshold,
    enabled: data.enabled !== false,
    createdAt: new Date(),
  };
}

export default {
  validateTrigger,
  validateAction,
  validateThreshold,
  validateDuration,
  isSpam,
  hasInvitation,
  excessiveMentions,
  createValidAutoModConfig,
};
