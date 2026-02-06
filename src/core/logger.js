/**
 * ⚠️ DEPRECATED - TEMPORAL
 * 
 * Este archivo será ELIMINADO en la próxima versión.
 * 
 * TODOS los imports DEBEN cambiar a:
 *   import logger from '../services/logger.js';
 * 
 * Se mantiene aquí SOLO como re-export de compatibilidad temporal
 * para evitar crashes si hay algún import antiguo.
 * 
 * Razón del movimiento:
 *   Logger pertenece a capa de SERVICES, no a CORE.
 *   Core es para: config, container, bootstrap, error handling.
 * 
 * Movido en: Fase 0 Hardening
 * Será eliminado en: Fase 1 (cuando se verifique 0 imports desde core)
 */

// Re-export temporal sin side effects
import logger from '../services/logger.js';
export default logger;
export { createLoggerScope } from '../services/logger.js';

