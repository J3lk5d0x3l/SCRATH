// src/systems/ModerationSystem.js
// Sistema de Moderación: casos de uso para mute/warn

import * as ModerationDomain from '../domains/ModerationDomain.js';

/**
 * Crear ModerationSystem
 */
export function createModerationSystem(repositories, logger) {
  return {
    /**
     * Advierte a un usuario
     */
    async warnUser(guildId, userId, reason, moderatorId = null, expiresAt = null) {
      try {
        // Valida
        ModerationDomain.validateWarnReason(reason);

        // Crea warning
        const warning = await repositories.warnings.create(
          guildId,
          userId,
          reason,
          moderatorId,
          expiresAt
        );

        // Cuenta warnings activos
        const count = await repositories.warnings.countActiveByUser(userId, guildId);

        logger.info(
          { guildId, userId, warningId: warning.id, totalWarnings: count },
          'Usuario advertido'
        );

        // Verifica si se debe aplicar auto-acción
        const autoAction = ModerationDomain.calculateAutoAction(count);
        if (autoAction) {
          logger.warn(
            { guildId, userId, autoAction, warningCount: count },
            `Auto-acción requerida: ${autoAction}`
          );
        }

        return { warning, totalWarnings: count, autoAction };
      } catch (error) {
        logger.error({ err: error, userId, guildId }, 'Error advirtiendo usuario');
        throw error;
      }
    },

    /**
     * Obtiene advertencias activas de un usuario
     */
    async getUserWarnings(guildId, userId) {
      try {
        const warnings = await repositories.warnings.findByUserId(userId, guildId, 100);
        const count = warnings.length;

        logger.debug({ guildId, userId, count }, 'Warnings obtenidos');

        return { warnings, count };
      } catch (error) {
        logger.error({ err: error, userId, guildId }, 'Error obteniendo warnings');
        throw error;
      }
    },

    /**
     * Elimina una advertencia específica
     */
    async removeWarning(warningId) {
      try {
        const removed = await repositories.warnings.deactivate(warningId);
        logger.info({ warningId }, 'Warning removido');
        return removed;
      } catch (error) {
        logger.error({ err: error, warningId }, 'Error removiendo warning');
        throw error;
      }
    },

    /**
     * Simula mute (en futura fase, será integración real con permisos)
     */
    async muteUser(guildId, userId, durationSeconds, reason, moderatorId = null) {
      try {
        ModerationDomain.validateMuteDuration(durationSeconds);

        // Ahora: solo log + auditoría
        // Futuro: integración real con Discord roles/permissions
        logger.info(
          {
            guildId,
            userId,
            durationSeconds,
            reason,
            moderatorId,
          },
          'Usuario muteado (simulado)'
        );

        return {
          success: true,
          message: `Usuario muteado por ${durationSeconds}s`,
          muteEndsAt: new Date(Date.now() + durationSeconds * 1000),
        };
      } catch (error) {
        logger.error({ err: error, userId, guildId }, 'Error muteando usuario');
        throw error;
      }
    },

    /**
     * Simula unmute
     */
    async unmuteUser(guildId, userId) {
      try {
        logger.info({ guildId, userId }, 'Usuario desmuteado (simulado)');

        return {
          success: true,
          message: 'Usuario desmuteado',
        };
      } catch (error) {
        logger.error({ err: error, userId, guildId }, 'Error desmuteando usuario');
        throw error;
      }
    },

    /**
     * Limpia warnings expirados
     */
    async cleanupExpiredWarnings() {
      try {
        const result = await repositories.warnings.cleanupExpired();
        logger.info({ deletedCount: result.count }, 'Warnings expirados limpiados');
        return result;
      } catch (error) {
        logger.error({ err: error }, 'Error limpiando warnings expirados');
      }
    },
  };
}
