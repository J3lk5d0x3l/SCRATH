// src/domains/BanDomain.js
// Dominio de Bans: reglas de negocio para baneos

/**
 * Valida que un usuario sea válido para banear
 */
export function validateUserCanBeBanned(user) {
  if (!user || !user.id) {
    throw new Error('Usuario inválido');
  }
  return true;
}

/**
 * Valida duración del ban
 */
export function validateBanDuration(durationSeconds) {
  if (durationSeconds !== null && durationSeconds !== undefined) {
    if (durationSeconds < 60) {
      throw new Error('El ban temporal debe ser al menos 1 minuto');
    }
    if (durationSeconds > 2592000) { // 30 días
      throw new Error('El ban no puede exceder 30 días');
    }
  }
  return true;
}

/**
 * Valida razón de baneo
 */
export function validateBanReason(reason) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('La razón del ban no puede estar vacía');
  }
  if (reason.length > 512) {
    throw new Error('La razón no puede exceder 512 caracteres');
  }
  return true;
}

/**
 * Crea evento de ban validado
 */
export function createValidBan(data) {
  validateBanReason(data.reason);
  validateBanDuration(data.durationSeconds);
  if (data.expiresAt && data.expiresAt < new Date()) {
    throw new Error('Fecha de expiración no puede ser en el pasado');
  }
  return {
    reason: data.reason,
    expiresAt: data.expiresAt || null,
  };
}
