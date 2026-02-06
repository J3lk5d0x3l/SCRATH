// src/core/bootstrap.js
// Bootstrap centralizado: inicializa servicios, cliente, eventos y comandos

import logger from '../services/logger.js';
import config, { validateConfig } from './config.js';
import { initializeContainer, shutdownContainer } from './container.js';
import { createDiscordClient } from '../infra/client.js';
import { loadCommands, registerSlashCommands } from '../infra/commandRegistry.js';
import { loadEvents, registerEvents } from '../infra/eventRegistry.js';

/**
 * Bootstrap principal: orquesta toda la inicialización
 * Garantiza orden correcto: listeners registrados ANTES de login
 *
 * @returns {Promise<Object>} { client, container }
 * @throws {Error} Si hay error en inicialización
 */
export async function bootstrap() {
  try {
    // 1. Valida configuración
    logger.info('Inicializando bot de Discord empresarial...');
    validateConfig();
    logger.info('✅ Configuración validada');

    // 2. Inicializa contenedor DI (BD, servicios, repos)
    const container = await initializeContainer();
    logger.info('✅ Contenedor DI inicializado');

    // 3. Crea cliente Discord
    const client = createDiscordClient();
    logger.info('✅ Cliente Discord creado');

    // 4. Carga comandos
    const commands = await loadCommands();
    client.commands = commands;
    logger.info({ count: commands.size }, '✅ Comandos cargados');

    // 5. Carga event handlers
    const events = await loadEvents();
    // ⚠️ CRÍTICO: Registrar eventos ANTES de client.login()
    // Esto evita race conditions donde el bot se conecta antes de registrar listeners
    registerEvents(client, events);
    logger.info({ count: events.length }, '✅ Manejadores de eventos registrados');

    // 6. Registra slash commands en Discord (cuando ready)
    // Se ejecuta DESPUÉS de login, cuando bot está listo
    client.once('ready', async () => {
      logger.info('🤖 Bot listo, registrando comandos slash...');
      try {
        // Guard: verificar que client tiene application context
        if (!client.application) {
          logger.warn('⚠️ Bot conectado pero sin contexto de aplicación. Comandos slash no registrados.');
          return;
        }
        await registerSlashCommands(client, commands);
        logger.info('✅ Comandos slash registrados en Discord');
      } catch (error) {
        logger.error({ err: error }, '❌ Error registrando comandos slash');
      }
    });

    // 7. Setup error handlers ANTES de login
    setupErrorHandlers(client, logger);

    // 8. Conecta a Discord
    logger.info('Conectando a Discord...');
    await client.login(config.discordToken);
    logger.info('✅ Autenticación iniciada, esperando ready...');

    // Retorna referencias para graceful shutdown
    return { client, container };

  } catch (error) {
    logger.error({ err: error }, '❌ Error crítico en bootstrap');
    throw error;
  }
}

/**
 * Setup de error handlers globales
 * @private
 */
function setupErrorHandlers(client, log) {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log.error({ reason, promise }, '❌ Unhandled Rejection');
  });

  // Uncaught exceptions
  process.on('uncaughtException', (error) => {
    log.error({ err: error }, '❌ Uncaught Exception');
  });

  // Discord client errors
  client.on('error', (error) => {
    log.error({ err: error }, '❌ Discord Client Error');
  });

  // Warnings
  client.on('warn', (message) => {
    log.warn(message, '⚠️ Advertencia de Discord');
  });
}

/**
 * Shutdown graceful del bot
 * @param {Client} client Discord client
 * @param {Object} container DI container
 */
export async function gracefulShutdown(client, container) {
  const log = logger.child({ context: 'shutdown' });

  try {
    log.info('🔌 Iniciando cierre con gracia...');

    // 1. Destruir cliente Discord
    if (client && client.readyAt) {
      await client.destroy();
      log.info('✅ Cliente Discord destruido');
    }

    // 2. Cerrar contenedor DI (BD, etc)
    if (container) {
      await shutdownContainer();
      log.info('✅ Contenedor DI cerrado');
    }

    log.info('✅ Cierre completado');
  } catch (error) {
    log.error({ err: error }, '❌ Error durante cierre');
    throw error;
  }
}

export default { bootstrap, gracefulShutdown };
