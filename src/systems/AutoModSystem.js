// src/systems/AutoModSystem.js
// Auto-moderation orchestration

import * as AutoModDomain from '../domains/AutoModDomain.js';

/**
 * Create AutoModSystem
 * @param {Object} params Dependencies
 * @param {Logger} params.logger Pino logger
 * @param {Object} params.repos Repository instances
 * @param {ModerationSystem} params.moderationSystem Moderation system
 * @returns {Object} AutoModSystem instance
 */
export function createAutoModSystem({ logger, repos, moderationSystem }) {
  const log = logger.child({ system: 'AutoModSystem' });

  /**
   * Get automod config for guild
   * @param {string} guildId Guild Discord ID
   * @returns {Promise<Object>} Automod rules
   */
  async function getAutoModConfig(guildId) {
    log.debug({ guildId }, '📋 Fetching automod config');

    // For now, return default config structure
    // Future: store in database
    return {
      guildId,
      rules: {
        spam: { enabled: false, action: 'warn', threshold: 5 },
        profanity: { enabled: false, action: 'delete', threshold: 1 },
        invites: { enabled: false, action: 'delete', threshold: 1 },
        mentions: { enabled: false, action: 'delete', threshold: 5 },
        caps: { enabled: false, action: 'delete', threshold: 1 },
      },
      updatedAt: new Date(),
    };
  }

  /**
   * Update automod rule
   * @param {string} guildId Guild ID
   * @param {string} trigger Trigger name
   * @param {Object} config Rule config
   * @returns {Promise<Object>} Updated config
   */
  async function updateAutoModRule(guildId, trigger, config) {
    log.info({ guildId, trigger, config }, '⚙️ Updating automod rule');

    if (!AutoModDomain.validateTrigger(trigger)) {
      throw new Error(`Invalid trigger: ${trigger}`);
    }

    if (!AutoModDomain.validateAction(config.action)) {
      throw new Error(`Invalid action: ${config.action}`);
    }

    if (!AutoModDomain.validateThreshold(config.threshold)) {
      throw new Error(`Invalid threshold: ${config.threshold}`);
    }

    // Future: persist to database
    return {
      guildId,
      trigger,
      ...config,
      updatedAt: new Date(),
    };
  }

  /**
   * Reset all automod rules for guild
   * @param {string} guildId Guild ID
   * @returns {Promise<boolean>} Success
   */
  async function resetAutoModRules(guildId) {
    log.info({ guildId }, '🔄 Resetting automod rules');
    // Future: delete all rules from database
    return true;
  }

  /**
   * Check message against automod rules
   * @param {Object} message Discord message
   * @param {Object} config Automod config
   * @returns {Promise<Object>} Detection result
   */
  async function checkMessage(message, config) {
    const violations = [];

    // Check spam (rapid messages + caps)
    if (config.rules.spam?.enabled) {
      // Would need message history for real implementation
      const isSpamFlag = AutoModDomain.isSpam(message.content, 0, config.rules.spam.threshold);
      if (isSpamFlag) {
        violations.push({
          type: 'spam',
          severity: 'medium',
          action: config.rules.spam.action,
        });
      }
    }

    // Check invitations
    if (config.rules.invites?.enabled && AutoModDomain.hasInvitation(message.content)) {
      violations.push({
        type: 'invites',
        severity: 'high',
        action: config.rules.invites.action,
      });
    }

    // Check mentions
    if (config.rules.mentions?.enabled) {
      const mentionCount = message.mentions?.size || 0;
      if (AutoModDomain.excessiveMentions(mentionCount, config.rules.mentions.threshold)) {
        violations.push({
          type: 'mentions',
          severity: 'medium',
          action: config.rules.mentions.action,
        });
      }
    }

    return {
      clean: violations.length === 0,
      violations,
      timestamp: new Date(),
    };
  }

  /**
   * Execute automod action
   * @param {Object} violation Violation object
   * @param {Object} message Discord message
   * @returns {Promise<boolean>} Success
   */
  async function executeViolationAction(violation, message) {
    log.info({ type: violation.type, action: violation.action }, '🔨 Executing automod action');

    try {
      switch (violation.action) {
        case 'delete':
          await message.delete().catch(() => {
            log.warn('Could not delete message');
          });
          break;

        case 'warn':
          if (moderationSystem) {
            await moderationSystem.warnUser(
              message.guildId,
              message.author.id,
              message.client.user.id,
              `Auto-warn: ${violation.type}`,
            );
          }
          break;

        case 'mute':
          if (moderationSystem) {
            await moderationSystem.muteUser(
              message.guildId,
              message.author.id,
              message.client.user.id,
              3600, // 1 hour
              `Auto-mute: ${violation.type}`,
            );
          }
          break;

        case 'kick':
          try {
            await message.member.kick(`Auto-kick: ${violation.type}`);
          } catch (err) {
            log.error(err, 'Could not kick member');
          }
          break;

        default:
          log.warn({ action: violation.action }, 'Unknown automod action');
      }

      return true;
    } catch (error) {
      log.error(error, 'Error executing violation action');
      return false;
    }
  }

  log.info('✅ AutoModSystem initialized');

  return {
    getAutoModConfig,
    updateAutoModRule,
    resetAutoModRules,
    checkMessage,
    executeViolationAction,
  };
}

export default { createAutoModSystem };
