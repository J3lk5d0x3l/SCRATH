import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('info').setDescription('Información del servidor').setDMPermission(false),
  permissions: { user: [], bot: ['SendMessages', 'EmbedLinks'] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'info', userId: interaction.user.id, guildId: interaction.guildId });
    try {
      const guild = interaction.guild;
      const embed = createInfoEmbed('Información del Servidor', `Nombre: **${guild.name}**\nMiembros: **${guild.memberCount}**`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /info');
      return interaction.reply({ content: 'No se pudo obtener la información del servidor.', ephemeral: true });
    }
  },
};

export default command;
