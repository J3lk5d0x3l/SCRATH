// src/utils/validators.js
// Validadores puros (sin estado, sin IO)

/**
 * Valida que un string sea válido Discord ID
 */
export function isValidDiscordId(id) {
  return /^\d{17,19}$/.test(String(id));
}

/**
 * Valida permisos de usuario
 */
export function hasPermissions(member, required) {
  if (!Array.isArray(required) || required.length === 0) return true;
  return required.every(perm => member.permissions.has(perm));
}

/**
 * Valida que string no esté vacío
 */
export function isNotEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Valida rango numérico
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Valida URL válida
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
