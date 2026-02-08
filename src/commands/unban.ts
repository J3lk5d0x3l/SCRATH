import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('unban').setDescription('Quitar ban a un usuario por ID').addStringOption(o=>o.setName('userid').setDescription('ID del usuario').setRequired(true)).setDMPermission(false),
  permissions: { user: ['BanMembers'], bot: ['BanMembers'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'unban', userId: interaction.user.id, guildId: interaction.guildId });
    const backpressure = getService('backpressure');
    if (!backpressure.tryAcquire(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'El sistema está ocupado. Intenta de nuevo en unos segundos.', ephemeral: true });

    try {
      const id = interaction.options.getString('userid');
      await interaction.guild.bans.remove(id);
      const embed = createSuccessEmbed('Usuario desbaneado', `Se removió el ban al usuario ${id}.`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /unban');
      const embed = createErrorEmbed('Error', 'No se pudo remover el ban. Verifica el ID y permisos.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } finally {
      backpressure.release(interaction.guildId, interaction.user.id);
    }
  },
};

export default command;
