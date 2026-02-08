import { getService } from '../core/container.js';

const event = {
  name: 'messageCreate',

  async execute(message: any) {
    if (message.author.bot) return;

    const logger = getService('logger').child({ userId: message.author.id, guildId: message.guildId, type: 'messageCreate' });

    try {
      // Placeholder: procesa menciones del bot, etc.
      if (message.mentions.has(message.client.user)) {
        // Respuesta simple a mención
        const embed = getService('embedFactory').createInfoEmbed('Hola', 'Usa `/help` para ver comandos disponibles.');
        return message.reply({ embeds: [embed] }).catch(() => null);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error en messageCreate');
    }
  },
};

export default event;
