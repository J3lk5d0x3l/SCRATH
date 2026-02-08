import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('config').setDescription('Ver configuración del servidor').setDMPermission(false),
  permissions: { user: [], bot: ['SendMessages', 'EmbedLinks'] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'config', userId: interaction.user.id, guildId: interaction.guildId });
    const repositories = getService('repositories');
    try {
      const settings = await repositories.getGuildSettingsByGuildId(interaction.guildId);
      if (!settings) return interaction.reply({ content: 'No hay configuración registrada para este servidor.', ephemeral: true });
      const embed = createInfoEmbed('Configuración del Servidor', `Prefijo: **${settings.prefix}**\nIdioma: **${settings.language}**\nLogs: **${settings.loggingEnabled ? 'Sí' : 'No'}**`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /config');
      return interaction.reply({ content: 'No se pudo obtener la configuración.', ephemeral: true });
    }
  },
};

export default command;
