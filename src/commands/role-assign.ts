import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('role-assign').setDescription('Asignar rol a un usuario').addUserOption(o=>o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o=>o.setName('rol').setDescription('Rol a asignar').setRequired(true)).setDMPermission(false),
  permissions: { user: ['ManageRoles'], bot: ['ManageRoles'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'role-assign', userId: interaction.user.id, guildId: interaction.guildId });
    try {
      const member = interaction.options.getMember('usuario');
      const role = interaction.options.getRole('rol');
      if (!member || !role) return interaction.reply({ content: 'Usuario o rol no encontrado.', ephemeral: true });
      await (member.roles as any).add(role.id);
      const embed = createSuccessEmbed('Rol asignado', `Se asignó el rol ${role.name} a ${member.user.tag}.`);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /role-assign');
      const embed = createErrorEmbed('Error', 'No se pudo asignar el rol. Verifica permisos.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
