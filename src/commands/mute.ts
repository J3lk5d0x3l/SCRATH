import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('mute').setDescription('Silenciar a un usuario (rol Muted)').addUserOption(o=>o.setName('usuario').setDescription('Usuario a silenciar').setRequired(true)).setDMPermission(false),
  permissions: { user: ['MuteMembers'] as any, bot: ['ManageRoles'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'mute', userId: interaction.user.id, guildId: interaction.guildId });
    try {
      const member = interaction.options.getMember('usuario');
      if (!member) return interaction.reply({ content: 'Usuario no encontrado.', ephemeral: true });

      let mutedRole = interaction.guild.roles.cache.find((r: any) => r.name.toLowerCase() === 'muted');
      if (!mutedRole) {
        mutedRole = await interaction.guild.roles.create({ name: 'Muted', permissions: [] });
      }

      await (member.roles as any).add(mutedRole.id);
      const embed = createSuccessEmbed('Usuario silenciado', `Se silenció a ${member.user.tag}.`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /mute');
      const embed = createErrorEmbed('Error', 'No se pudo silenciar al usuario.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
