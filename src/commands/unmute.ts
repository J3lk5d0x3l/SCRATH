import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('unmute').setDescription('Quitar silencio a un usuario').addUserOption(o=>o.setName('usuario').setDescription('Usuario').setRequired(true)).setDMPermission(false),
  permissions: { user: [], bot: ['ManageRoles'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'unmute', userId: interaction.user.id, guildId: interaction.guildId });
    try {
      const member = interaction.options.getMember('usuario');
      if (!member) return interaction.reply({ content: 'Usuario no encontrado.', ephemeral: true });

      const mutedRole = interaction.guild.roles.cache.find((r: any) => r.name.toLowerCase() === 'muted');
      if (mutedRole) await (member.roles as any).remove(mutedRole.id);

      const embed = createSuccessEmbed('Usuario desilenciado', `Se quitó el silencio a ${member.user.tag}.`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /unmute');
      const embed = createErrorEmbed('Error', 'No se pudo quitar el silencio.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
