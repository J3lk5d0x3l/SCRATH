import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed, createSuccessEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('automod').setDescription('Configurar moderación automática (activar/desactivar)').addBooleanOption(o=>o.setName('activar').setDescription('Activar o desactivar').setRequired(true)).setDMPermission(false),
  permissions: { user: ['ManageGuild'], bot: [] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'automod', userId: interaction.user.id, guildId: interaction.guildId });
    const repositories = getService('repositories');

    try {
      const activar = interaction.options.getBoolean('activar');
      await repositories.setFeatureFlag(`automod:${interaction.guildId}`, !!activar);
      const embed = createSuccessEmbed('AutoMod', `Moderación automática ${activar ? 'activada' : 'desactivada'}.`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /automod');
      const embed = createInfoEmbed('Error', 'No se pudo actualizar la configuración de automod.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
