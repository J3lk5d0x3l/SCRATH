// src/domains/ModerationDomain.js
// Dominio de Moderación: reglas de negocio para mute/warn

/**
 * Valida que un usuario sea válido para moderar
 */
export function validateUserCanBeMuted(user) {
  if (!user || !user.id) {
    throw new Error('Usuario inválido');
  }
  return true;
}

/**
 * Valida duración del mute
 */
export function validateMuteDuration(durationSeconds) {
  if (durationSeconds < 60) {
    throw new Error('El mute debe ser al menos 1 minuto');
  }
  if (durationSeconds > 604800) { // 1 semana
    throw new Error('El mute no puede exceder 7 días');
  }
  return true;
}

/**
 * Valida razón de advertencia
 */
export function validateWarnReason(reason) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('La razón de advertencia no puede estar vacía');
  }
  if (reason.length > 500) {
    throw new Error('La razón no puede exceder 500 caracteres');
  }
  return true;
}

/**
 * Calcula si un usuario debe ser automáticamente sancionado por warns
 * (ej: 3 warns = kick, 5 warns = ban)
 */
export function calculateAutoAction(warningCount) {
  if (warningCount >= 5) return 'BAN';
  if (warningCount >= 3) return 'KICK';
  return null;
}

/**
 * Crea evento de advertencia validado
 */
export function createValidWarning(data) {
  validateWarnReason(data.reason);
  if (data.expiresAt && data.expiresAt < new Date()) {
    throw new Error('Fecha de expiración no puede ser en el pasado');
  }
  return {
    reason: data.reason,
    expiresAt: data.expiresAt || null,
  };
}
