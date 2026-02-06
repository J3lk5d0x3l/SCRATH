// src/events/guildCreate.js
// Event handler: cuando el bot se une a un servidor

import { getService } from '../core/container.js';

const event = {
  name: 'guildCreate',

  async execute(guild) {
    const container = getService('config'); // Para contexto
    const logger = getService('logger').child({ guildId: guild.id });

    try {
      // Aquí se crearía el guild en BD (Fase 2+)
      logger.info(
        {
          guildId: guild.id,
          guildName: guild.name,
          memberCount: guild.memberCount,
        },
        'Bot añadido a nuevo servidor'
      );

      // Envía mensaje de bienvenida (si hay canal #general o similar)
      const defaultChannel = guild.systemChannel || guild.channels.cache.first();
      if (defaultChannel?.isTextBased()) {
        const embed = {
          color: 0x2ecc71,
          title: '👋 ¡Hola! Soy tu nuevo Bot',
          description: 'Usa `/help` para ver todos los comandos disponibles.',
          footer: { text: 'Enterprise Discord Bot - Fase 2' },
          timestamp: new Date(),
        };
        defaultChannel.send({ embeds: [embed] }).catch(() => {
          logger.debug('No se pudo enviar mensaje de bienvenida');
        });
      }
    } catch (error) {
      logger.error({ err: error }, 'Error en evento guildCreate');
    }
  },
};

export default event;
