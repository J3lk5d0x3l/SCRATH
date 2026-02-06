// src/commands/role-assign.js
// Assign roles to users automatically

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('role-assign')
    .setDescription('Asigna roles a usuarios')
    .setDMPermission(false)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Asigna un rol a un usuario')
        .addUserOption(opt =>
          opt
            .setName('usuario')
            .setDescription('Usuario a asignar')
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName('rol')
            .setDescription('Rol a asignar')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Remueve un rol de un usuario')
        .addUserOption(opt =>
          opt
            .setName('usuario')
            .setDescription('Usuario a remover')
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName('rol')
            .setDescription('Rol a remover')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('clear')
        .setDescription('Remueve todos los roles de un usuario')
        .addUserOption(opt =>
          opt
            .setName('usuario')
            .setDescription('Usuario a limpiar')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  permissions: {
    user: ['MANAGE_ROLES'],
    bot: ['MANAGE_ROLES'],
  },

  cooldown: 3,

  async execute(interaction) {
    const logger = getService('logger');
    const audit = getService('audit');
    const rateLimit = getService('rateLimit');
    const embedFactory = getService('embedFactory');

    const childLog = logger.child({
      command: 'role-assign',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      // Rate limit
      const rateLimitCheck = rateLimit.checkCommand('role-assign', interaction.user.id);
      if (!rateLimitCheck.allowed) {
        const cooldown = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
        const embed = embedFactory.createErrorEmbed(
          '⏱ Cooldown',
          `Espera ${cooldown}s`
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();
      const targetUser = interaction.options.getUser('usuario');
      const role = interaction.options.getRole('rol');

      // Get target member
      let targetMember;
      try {
        targetMember = await interaction.guild.members.fetch(targetUser.id);
      } catch {
        const embed = embedFactory.createErrorEmbed(
          '❌ Usuario no encontrado',
          'El usuario no está en el servidor'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'add') {
        // Check if user already has role
        if (targetMember.roles.cache.has(role.id)) {
          const embed = embedFactory.createWarningEmbed(
            '⚠️ Rol existente',
            `${targetUser.username} ya tiene el rol ${role.name}`
          );
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Add role
        await targetMember.roles.add(role);

        childLog.info({ targetId: targetUser.id, roleId: role.id }, '➕ Rol asignado');

        await audit.log({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          action: 'ROLE_ASSIGNED',
          resourceType: 'ROLE',
          resourceId: role.id,
          details: { targetUserId: targetUser.id, roleName: role.name },
          status: 'SUCCESS',
        });

        const embed = embedFactory.createSuccessEmbed(
          '✅ Rol asignado',
          `${targetUser.username} ahora tiene el rol **${role.name}**`
        );
        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'remove') {
        // Check if user has role
        if (!targetMember.roles.cache.has(role.id)) {
          const embed = embedFactory.createWarningEmbed(
            '⚠️ Rol no encontrado',
            `${targetUser.username} no tiene el rol ${role.name}`
          );
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Remove role
        await targetMember.roles.remove(role);

        childLog.info({ targetId: targetUser.id, roleId: role.id }, '➖ Rol removido');

        await audit.log({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          action: 'ROLE_REMOVED',
          resourceType: 'ROLE',
          resourceId: role.id,
          details: { targetUserId: targetUser.id, roleName: role.name },
          status: 'SUCCESS',
        });

        const embed = embedFactory.createSuccessEmbed(
          '✅ Rol removido',
          `${targetUser.username} ya no tiene el rol **${role.name}**`
        );
        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'clear') {
        const rolesCount = targetMember.roles.cache.size;

        if (rolesCount <= 1) {
          const embed = embedFactory.createWarningEmbed(
            '⚠️ Sin roles',
            `${targetUser.username} no tiene roles asignables`
          );
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Remove all roles except @everyone
        await targetMember.roles.removeAll();

        childLog.info({ targetId: targetUser.id, count: rolesCount }, '🗑️ Todos los roles removidos');

        await audit.log({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          action: 'ROLES_CLEARED',
          resourceType: 'USER',
          resourceId: targetUser.id,
          details: { rolesRemoved: rolesCount - 1 },
          status: 'SUCCESS',
        });

        const embed = embedFactory.createSuccessEmbed(
          '✅ Roles removidos',
          `Se removieron todos los roles de ${targetUser.username}`
        );
        return interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      childLog.error(error, 'Error en role-assign');

      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'ROLE_ASSIGNMENT_FAILED',
        status: 'FAILED',
        errorMessage: error.message,
      });

      const embed = embedFactory.createErrorEmbed(
        '❌ Error',
        'Ocurrió un error al asignar el rol'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
