// src/commands/ban.js
// Comando /ban: banea a un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';
import { banUser } from '../utils/discord-helpers.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a banear')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razón')
        .setDescription('Razón del ban')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('días-de-mensajes')
        .setDescription('Días de mensajes a eliminar (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  permissions: {
    user: ['BAN_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'ban',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const target = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razón') || 'Sin especificar';
      const deleteMessageDays = interaction.options.getInteger('días-de-mensajes') || 0;

      if (target.id === interaction.user.id) {
        const embed = createErrorEmbed(
          'Error',
          'No puedes banearte a ti mismo'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (target.bot) {
        const embed = createErrorEmbed(
          'Error',
          'No puedes banear a otros bots'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Banea en Discord
      await banUser(interaction.guild, target.id, reason, logger);

      // Audita
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_BANNED',
        resourceType: 'USER',
        resourceId: target.id,
        details: { reason, deleteMessageDays },
        status: 'SUCCESS',
      });

      const fields = [
        { name: '👤 Usuario', value: `${target.username}#${target.discriminator || '0'}`, inline: true },
        { name: '🔨 Acción', value: 'Baneado Permanentemente', inline: true },
        { name: '📝 Razón', value: reason, inline: false },
        { name: '🗑️ Mensajes Eliminados', value: `${deleteMessageDays} días`, inline: true },
      ];

      const embed = createSuccessEmbed(
        'Usuario Baneado',
        `${target.username} ha sido removido del servidor`,
        fields
      );

      logger.info({ targetId: target.id, reason }, 'Usuario baneado');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ error }, 'Error en comando /ban');

      const embed = createErrorEmbed(
        'Error',
        error.message || 'No se pudo aplicar el ban. Verifica permisos.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
