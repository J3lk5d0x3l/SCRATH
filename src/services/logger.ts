import pino from 'pino';
import config from '../core/config.js';

const isProduction = process.env.NODE_ENV === 'production';

const pinoConfig: pino.LoggerOptions = {
  level: config.logLevel,
  base: {
    environment: config.environment,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  },
};

const loggerInstance = isProduction
  ? pino(pinoConfig)
  : pino(
      pinoConfig,
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          errorLikeObjectKeys: ['err', 'error'],
        },
      })
    );

export function createLoggerScope(context: Record<string, any> = {}) {
  return loggerInstance.child(context);
}

export default loggerInstance;
