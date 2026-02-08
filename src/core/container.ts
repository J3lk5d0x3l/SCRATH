import logger from '../services/logger.js';
import config from '../core/config.js';
import { initializeDatabase, shutdownDatabase } from '../database/client.js';
import { createRepositories } from '../database/repositories.js';
import * as embedFactory from '../services/embedFactory.js';
import { createAuditService } from '../services/audit.js';
import { createFeatureFlagService } from '../services/featureFlags.js';
import { createRateLimitService } from '../services/rateLimit.js';
import { createBackpressureService } from '../services/backpressure.js';
import { initializeHealth } from '../services/health.js';

const services: Record<string, any> = {};

export async function initializeContainer() {
  try {
    logger.info('Inicializando contenedor DI...');

    const db = initializeDatabase();
    services.db = db;

    const repositories = createRepositories();
    services.repositories = repositories;

    services.audit = createAuditService(repositories, logger);
    services.featureFlags = createFeatureFlagService(repositories, logger, config);
    services.rateLimit = createRateLimitService(logger, config);
    services.backpressure = createBackpressureService();
    services.embedFactory = embedFactory;

    services.config = config;
    services.logger = logger;

    initializeHealth();

    logger.info('Contenedor DI inicializado correctamente');
    return services;
  } catch (error) {
    logger.error({ err: error }, 'Error inicializando contenedor DI');
    throw error;
  }
}

export function getService(serviceName: string): any {
  if (!services[serviceName]) {
    throw new Error(`Servicio no registrado: ${serviceName}`);
  }
  return services[serviceName];
}

export function getContainer() {
  return services;
}

export async function shutdownContainer() {
  try {
    logger.info('Cerrando contenedor DI...');
    await shutdownDatabase();
    logger.info('Contenedor DI cerrado correctamente');
  } catch (error) {
    logger.error({ err: error }, 'Error cerrando contenedor DI');
  }
}

export { services };

