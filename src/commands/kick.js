// src/commands/kick.js
// Kick a user from the guild

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a expulsar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razon')
        .setDescription('Razón de la expulsión')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  permissions: {
    user: ['KICK_MEMBERS'],
    bot: ['KICK_MEMBERS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger');
    const audit = getService('audit');
    const rateLimit = getService('rateLimit');
    const embedFactory = getService('embedFactory');

    const childLog = logger.child({
      command: 'kick',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      // 1. Rate limit check
      const rateLimitCheck = rateLimit.checkCommand('kick', interaction.user.id);
      if (!rateLimitCheck.allowed) {
        const cooldown = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
        const embed = embedFactory.createErrorEmbed(
          '⏱ Cooldown',
          `Espera ${cooldown}s antes de usar este comando nuevamente`
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // 2. Get target and reason
      const targetUser = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón especificada';

      // 3. Get target member
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

      // 4. Check permissions
      if (!targetMember.kickable) {
        const embed = embedFactory.createErrorEmbed(
          '❌ No permiso',
          'No puedo expulsar a este usuario (rol muy alto o sin permisos)'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // 5. Prevent self-kick
      if (targetUser.id === interaction.user.id) {
        const embed = embedFactory.createErrorEmbed(
          '❌ Acción rechazada',
          'No puedes expulsarte a ti mismo'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // 6. Execute kick
      await targetMember.kick(reason);

      childLog.info({ targetId: targetUser.id, reason }, '👢 Usuario expulsado');

      // 7. Audit log
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_KICKED',
        resourceType: 'USER',
        resourceId: targetUser.id,
        details: { reason },
        status: 'SUCCESS',
      });

      // 8. Response
      const embed = embedFactory.createSuccessEmbed(
        '✅ Usuario expulsado',
        `${targetUser.username} ha sido expulsado del servidor.\n**Razón:** ${reason}`
      );
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      childLog.error(error, 'Error ejecutando kick');

      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_KICKED',
        status: 'FAILED',
        errorMessage: error.message,
      });

      const embed = embedFactory.createErrorEmbed(
        '❌ Error',
        'Ocurrió un error al expulsar al usuario'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
