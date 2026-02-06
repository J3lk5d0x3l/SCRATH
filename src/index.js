// src/index.js
// Punto de entrada principal: carga .env, ejecuta bootstrap, maneja shutdown graceful
//
// VALIDACIÓN POSTERIOR (checklist local):
// ✓ npm start - debe conectar sin condiciones de carrera
// ✓ /help - comando debe responder
// ✓ Mención @bot - debe responder con ping
// ✓ Ctrl+C - shutdown graceful sin errores
// ✓ Logs: "Manejadores de eventos registrados" ANTES de "Conectando a Discord"

import 'dotenv/config';
import logger from './services/logger.js';
import { bootstrap, gracefulShutdown } from './core/bootstrap.js';

/**
 * Punto de entrada principal
 */
async function main() {
  let client;
  let container;

  try {
    // Ejecuta bootstrap centralizado
    const { client: c, container: cont } = await bootstrap();
    client = c;
    container = cont;

    // Manejo de shutdown graceful
    const signals = ['SIGINT', 'SIGTERM'];
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

// Ejecuta
main();
