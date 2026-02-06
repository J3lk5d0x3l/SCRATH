// src/domains/ConfigDomain.js
// Dominio de Configuración: reglas de negocio para settings

/**
 * Valida que un prefix sea válido
 */
export function validatePrefix(prefix) {
  if (!prefix || prefix.length === 0) {
    throw new Error('Prefix no puede estar vacío');
  }
  if (prefix.length > 5) {
    throw new Error('Prefix no puede exceder 5 caracteres');
  }
  return true;
}

/**
 * Valida que un lenguaje sea soportado
 */
export function validateLanguage(language) {
  const supported = ['es', 'en', 'fr', 'de'];
  if (!supported.includes(language)) {
    throw new Error(`Lenguaje no soportado. Opciones: ${supported.join(', ')}`);
  }
  return true;
}

/**
 * Valida que loggingEnabled sea booleano
 */
export function validateLoggingEnabled(enabled) {
  if (typeof enabled !== 'boolean') {
    throw new Error('loggingEnabled debe ser true o false');
  }
  return true;
}

/**
 * Crea objeto settings validado
 */
export function createValidSettings(data) {
  const settings = {
    prefix: data.prefix || '!',
    language: data.language || 'es',
    loggingEnabled: data.loggingEnabled !== undefined ? data.loggingEnabled : true,
  };

  validatePrefix(settings.prefix);
  validateLanguage(settings.language);
  validateLoggingEnabled(settings.loggingEnabled);

  return settings;
}
