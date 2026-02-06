// src/events/messageCreate.js
// Event: responde cuando el bot es mencionado directamente (mensaje solo con la mención)

import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const event = {
  name: 'messageCreate',

  async execute(message) {
    // Validar message.author antes de usarlo
    if (!message.author) return;

    const logger = getService('logger').child({ userId: message.author.id, channelId: message.channelId });

    try {
      if (message.author.bot) return; // Ignora bots

      const clientUser = message.client?.user;
      if (!clientUser) return;

      const content = (message.content || '').trim();
      const mention1 = `<@${clientUser.id}>`;
      const mention2 = `<@!${clientUser.id}>`;

      // Responde solo si el mensaje contiene únicamente la mención al bot
      if (content !== mention1 && content !== mention2) return;

      // Intenta delegar en MentionHandlerSystem
      try {
        const mentionHandler = getService('mentionHandlerSystem');
        if (mentionHandler && typeof mentionHandler.handleMention === 'function') {
          return await mentionHandler.handleMention(message);
        }
      } catch (err) {
        // Si no existe el servicio, caemos al fallback
        logger.debug('MentionHandlerSystem no disponible, usando fallback');
      }

      // Fallback mínimo si no hay sistema: responde con embed informativo
      const embed = createInfoEmbed('Hola', 'Hola! Usa `/help` para ver los comandos disponibles.');
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (error) {
      logger.error({ err: error }, 'Error manejando messageCreate');
    }
  },
};

export default event;
