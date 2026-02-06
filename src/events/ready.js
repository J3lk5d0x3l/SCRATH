// src/events/ready.js
// Event handler: bot ready

import { getService } from '../core/container.js';

const event = {
  name: 'ready',
  once: true,

  async execute(client) {
    const logger = getService('logger');

    logger.info(
      {
        botTag: client.user.tag,
        botId: client.user.id,
        guildCount: client.guilds.cache.size,
        shardId: client.shard?.ids[0] || 0,
      },
      '🤖 Bot conectado y listo'
    );

    // Registra slash commands
    try {
      const commands = client.commands || new Map();
      logger.info(
        { commandCount: commands.size },
        'Comandos cargados y registrados'
      );
    } catch (error) {
      logger.error({ err: error }, 'Error verificando comandos en ready');
    }
  },
};

export default event;
