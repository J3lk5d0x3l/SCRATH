import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('bot-status').setDescription('Cambiar estado del bot (solo administradores)').addStringOption(o=>o.setName('texto').setDescription('Texto de estado').setRequired(true)).setDMPermission(false),
  permissions: { user: ['Administrator'], bot: [] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'bot-status', userId: interaction.user.id });
    try {
      const texto = interaction.options.getString('texto');
      await interaction.client.user.setPresence({ activities: [{ name: texto }], status: 'online' });
      const embed = createSuccessEmbed('Estado actualizado', `Estado del bot cambiado a: ${texto}`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /bot-status');
      const embed = createErrorEmbed('Error', 'No se pudo actualizar el estado del bot.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
