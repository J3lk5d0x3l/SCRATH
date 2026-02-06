// src/services/logger.js
// Logger estructurado centralizado (pino)
// Producción: JSON limpio | Desarrollo: Pretty-printed

import pino from 'pino';
import config from '../core/config.js';

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

// Configuración base de pino
const pinoConfig = {
  level: config.logLevel,
  base: {
    environment: config.environment,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Serializers para asegurar que objetos Error se serializan correctamente
  serializers: {
    err: pino.stdSerializers.err,
  },
};

// Crear logger con transport condicional
const loggerInstance = isProduction
  ? pino(pinoConfig) // Producción: JSON limpio, sin pretty
  : pino(
        pinoConfig,
        pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            // Asegura que pino-pretty trate las claves 'err' y 'error' como objetos de error
            errorLikeObjectKeys: ['err', 'error'],
          },
        })
      );

/**
 * Logger child scope con contexto
 * @param {Object} context - { shardId, guildId, userId, correlationId, commandName, etc. }
 * @returns {Object} logger scoped
 */
export function createLoggerScope(context = {}) {
  return loggerInstance.child(context);
}

export default loggerInstance;
