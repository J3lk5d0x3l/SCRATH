// src/commands/purge.js
// Delete multiple messages from a channel

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Elimina múltiples mensajes del canal')
    .setDMPermission(false)
    .addIntegerOption(option =>
      option
        .setName('cantidad')
        .setDescription('Número de mensajes a eliminar (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Opcional: eliminar solo mensajes de este usuario')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  permissions: {
    user: ['MANAGE_MESSAGES'],
    bot: ['MANAGE_MESSAGES'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger');
    const audit = getService('audit');
    const rateLimit = getService('rateLimit');
    const embedFactory = getService('embedFactory');

    const childLog = logger.child({
      command: 'purge',
      userId: interaction.user.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    });

    try {
      // Defer reply (might take time)
      await interaction.deferReply();

      // Rate limit
      const rateLimitCheck = rateLimit.checkCommand('purge', interaction.user.id);
      if (!rateLimitCheck.allowed) {
        const cooldown = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
        const embed = embedFactory.createErrorEmbed(
          '⏱ Cooldown',
          `Espera ${cooldown}s`
        );
        return interaction.editReply({ embeds: [embed] });
      }

      const amount = interaction.options.getInteger('cantidad');
      const targetUser = interaction.options.getUser('usuario');

      // Fetch messages
      let messages = await interaction.channel.messages.fetch({ limit: amount });

      // Filter by user if specified
      if (targetUser) {
        messages = messages.filter(msg => msg.author.id === targetUser.id);
      }

      // Cannot delete messages older than 14 days
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      messages = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);

      if (messages.size === 0) {
        const embed = embedFactory.createWarningEmbed(
          '⚠️ Sin mensajes',
          'No hay mensajes que eliminar'
        );
        return interaction.editReply({ embeds: [embed] });
      }

      // Delete messages
      let deletedCount = 0;
      let failedCount = 0;

      for (const msg of messages.values()) {
        try {
          await msg.delete();
          deletedCount++;
        } catch {
          failedCount++;
        }
      }

      childLog.info({ amount, deleted: deletedCount, failed: failedCount }, '🗑️ Mensajes eliminados');

      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'MESSAGES_PURGED',
        resourceType: 'CHANNEL',
        resourceId: interaction.channelId,
        details: { deleted: deletedCount, failed: failedCount, targetUser: targetUser?.id },
        status: 'SUCCESS',
      });

      const embed = embedFactory.createSuccessEmbed(
        '🗑️ Limpieza completada',
        `Se eliminaron **${deletedCount}** mensajes${failedCount > 0 ? ` (${failedCount} no pudieron eliminarse)` : ''}`
      );
      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      childLog.error(error, 'Error en purge');

      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'MESSAGES_PURGED',
        status: 'FAILED',
        errorMessage: error.message,
      });

      const embed = embedFactory.createErrorEmbed(
        '❌ Error',
        'Ocurrió un error al limpiar mensajes'
      );
      return interaction.editReply({ embeds: [embed] });
    }
  },
};

export default command;
