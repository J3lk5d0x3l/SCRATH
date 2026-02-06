// src/systems/MentionHandlerSystem.js
// Sistema mínimo para manejar menciones directas al bot

export function createMentionHandlerSystem({ logger, embedFactory }) {
  return {
    async handleMention(message) {
      try {
        const embed = embedFactory.createInfoEmbed(
          'Hola',
          'Hola! Usa `/help` para ver los comandos disponibles.'
        );

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        logger.info({ userId: message.author.id, channelId: message.channel.id }, 'Respuesta enviada por mención directa');
      } catch (error) {
        logger.error({ err: error }, 'Error en MentionHandlerSystem.handleMention');
      }
    },
  };
}
