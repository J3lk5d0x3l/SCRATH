import 'dotenv/config';
import logger from './services/logger.js';
import { bootstrap, gracefulShutdown } from './core/bootstrap.js';

async function main(): Promise<void> {
  let client: any;
  let container: any;

  try {
    const result = await bootstrap();
    client = result.client;
    container = result.container;

    const signals = ['SIGINT', 'SIGTERM'] as const;
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`Señal recibida: ${signal}, cerrando con gracia...`);
        try {
          await gracefulShutdown(client, container);
        } catch (error) {
          logger.error({ error }, '❌ Error durante shutdown');
        }
        process.exit(0);
      });
    }

  } catch (error) {
    logger.error({ err: error }, '❌ Error crítico en inicio');
    process.exit(1);
  }
}

main();
