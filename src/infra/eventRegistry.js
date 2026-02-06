// src/infra/eventRegistry.js
// Carga dinámicamente todos los event handlers de src/events

import logger from '../services/logger.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Carga todos los event handlers de src/events
 */
export async function loadEvents() {
  const events = [];
  const eventPath = join(__dirname, '../events');

  try {
    const files = await readdir(eventPath);
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.startsWith('.'));

    logger.info({ count: jsFiles.length }, 'Cargando event handlers...');

    for (const file of jsFiles) {
      try {
        const event = await import(`../events/${file}`);
        const eventModule = event.default || event;

        if (!eventModule.name || !eventModule.execute) {
          logger.warn({ file }, 'Evento sin metadata (name/execute)');
          continue;
        }

        events.push(eventModule);
        logger.debug({ event: eventModule.name }, 'Event handler cargado');
      } catch (error) {
        logger.error({ file, error }, 'Error cargando event handler');
      }
    }

    logger.info({ total: events.length }, 'Event handlers cargados correctamente');
    return events;
    } catch (error) {
    logger.error({ err: error }, 'Error en registry de eventos');
    throw error;
  }
}

/**
 * Registra event handlers en el cliente Discord
 */
export function registerEvents(client, events) {
  try {
    for (const event of events) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      logger.debug({ event: event.name }, 'Event handler registrado');
    }

    logger.info({ total: events.length }, 'Todos los event handlers registrados');
  } catch (error) {
    logger.error({ err: error }, 'Error registrando event handlers');
    throw error;
  }
}
