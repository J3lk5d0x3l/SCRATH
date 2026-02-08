import logger from '../services/logger.js';
import config, { validateConfig } from './config.js';
import { initializeContainer, shutdownContainer } from './container.js';
import { createDiscordClient } from '../infra/client.js';
import { loadCommands, registerSlashCommands } from '../infra/commandRegistry.js';
import { loadEvents, registerEvents } from '../infra/eventRegistry.js';

export async function bootstrap(): Promise<{ client: any; container: any }> {
  try {
    logger.info('Inicializando bot de Discord empresarial...');
    validateConfig();

    const container = await initializeContainer();
    logger.info('✅ Contenedor DI inicializado');

    const client = createDiscordClient();
    logger.info('✅ Cliente Discord creado');

    const commands = await loadCommands();
    // @ts-ignore asignación dinámica
    client.commands = commands;
    logger.info({ count: commands.size }, '✅ Comandos cargados');

    const events = await loadEvents();
    registerEvents(client, events);
    logger.info({ count: events.length }, '✅ Manejadores de eventos registrados');

    client.once('ready', async () => {
      logger.info('🤖 Bot listo, registrando comandos slash...');
      try {
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

    setupErrorHandlers(client, logger);

    logger.info('Conectando a Discord...');
    await client.login(config.discordToken);
    logger.info('✅ Autenticación iniciada, esperando ready...');

    return { client, container };
  } catch (error) {
    logger.error({ err: error }, '❌ Error crítico en bootstrap');
    throw error;
  }
}

function setupErrorHandlers(client: any, log: any) {
  process.on('unhandledRejection', (reason, promise) => {
    log.error({ reason, promise }, '❌ Unhandled Rejection');
  });

  process.on('uncaughtException', (error) => {
    log.error({ err: error }, '❌ Uncaught Exception');
  });

  client.on('error', (error: any) => {
    log.error({ err: error }, '❌ Discord Client Error');
  });

  client.on('warn', (message: any) => {
    log.warn(message, '⚠️ Advertencia de Discord');
  });
}

export async function gracefulShutdown(client: any, container: any) {
  const log = logger.child({ context: 'shutdown' });

  try {
    log.info('🔌 Iniciando cierre con gracia...');

    if (client && client.readyAt) {
      await client.destroy();
      log.info('✅ Cliente Discord destruido');
    }

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
