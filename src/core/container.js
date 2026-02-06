// src/core/container.js
// Inyección de dependencias: DI container singleton

import logger from '../services/logger.js';
import config from './config.js';
import { PrismaClient } from '@prisma/client';
import { initializePrisma } from '../database/client.js';
import { createRepositories } from '../database/repositories.js';
import { createAuditService } from '../services/audit.js';
import { createFeatureFlagService } from '../services/featureFlags.js';
import { createRateLimitService } from '../services/rateLimit.js';
import { createUserSystem } from '../systems/UserSystem.js';
import { createGuildSystem } from '../systems/GuildSystem.js';
import { createConfigSystem } from '../systems/ConfigSystem.js';
import { createModerationSystem } from '../systems/ModerationSystem.js';
import { createStatisticsSystem } from '../systems/StatisticsSystem.js';
import { createAutoModSystem } from '../systems/AutoModSystem.js';
import { createShardingSystem } from '../systems/ShardingSystem.js';
import { createMentionHandlerSystem } from '../systems/MentionHandlerSystem.js';
import * as embedFactory from '../services/embedFactory.js';
import { initializeHealth } from '../services/health.js';

const services = {};
const initialized = false;

/**
 * Inicializa contenedor con todos los servicios
 */
export async function initializeContainer() {
  try {
    logger.info('Inicializando contenedor DI...');

    // Database
    const prisma = new PrismaClient();
    await initializePrisma(prisma);
    services.prisma = prisma;

    // Repositories
    const repositories = createRepositories(prisma, logger);
    services.repositories = repositories;

    // Services
    services.audit = createAuditService(repositories, logger);
    services.featureFlags = createFeatureFlagService(repositories.featureFlags, logger, config);
    services.rateLimit = createRateLimitService(logger, config);
    // Embed factory como servicio para compatibilidad con getService('embedFactory')
    services.embedFactory = embedFactory;

    // Systems
    services.userSystem = createUserSystem(repositories, logger);
    services.guildSystem = createGuildSystem(repositories, logger);
    services.configSystem = createConfigSystem(repositories, logger);
    services.moderationSystem = createModerationSystem(repositories, logger);
    services.statisticsSystem = createStatisticsSystem(repositories, logger, null); // client se asigna en index.js
    services.autoModSystem = createAutoModSystem({ logger, repos: repositories, moderationSystem: services.moderationSystem });
    services.shardingSystem = createShardingSystem({ logger, client: null }); // client se asigna en index.js

    // Config y Logger
    services.config = config;
    services.logger = logger;

    // Systems que dependen de servicios ya creados
    services.mentionHandlerSystem = createMentionHandlerSystem({ logger: services.logger, embedFactory: services.embedFactory });

    logger.info('Contenedor DI inicializado correctamente');
    return services;
  } catch (error) {
    logger.error({ err: error }, 'Error inicializando contenedor DI');
    throw error;
  }
}

/**
 * Obtiene servicio del contenedor
 */
export function getService(serviceName) {
  if (!services[serviceName]) {
    throw new Error(`Servicio no registrado: ${serviceName}`);
  }
  return services[serviceName];
}

/**
 * Obtiene contenedor completo
 */
export function getContainer() {
  return services;
}

/**
 * Limpia recursos (cierra BD, etc.)
 */
export async function shutdownContainer() {
  try {
    logger.info('Cerrando contenedor DI...');
    if (services.prisma) {
      await services.prisma.$disconnect();
    }
    logger.info('Contenedor DI cerrado correctamente');
  } catch (error) {
    logger.error({ err: error }, 'Error cerrando contenedor DI');
  }
}

export { services };
