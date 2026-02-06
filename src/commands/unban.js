// src/commands/unban.js
// Comando /unban: desbanea a un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';
import { unbanUser } from '../utils/discord-helpers.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('usuario-id')
        .setDescription('ID del usuario a desbanear')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razón')
        .setDescription('Razón del unban')
        .setRequired(false)
    ),

  permissions: {
    user: ['BAN_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'unban',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const userId = interaction.options.getString('usuario-id');
      const reason = interaction.options.getString('razón') || 'Sin especificar';

      // Valida que sea un ID válido
      if (!/^\d{17,19}$/.test(userId)) {
        const embed = createErrorEmbed(
          'ID Inválido',
          'Proporciona un ID de usuario válido (17-19 dígitos)'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Desbanea en Discord
      await unbanUser(interaction.guild, userId, reason, logger);

      // Audita
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_UNBANNED',
        resourceType: 'USER',
        resourceId: userId,
        details: { reason },
        status: 'SUCCESS',
      });

      const fields = [
        { name: '🆔 Usuario ID', value: userId, inline: true },
        { name: '✅ Acción', value: 'Desbaneado', inline: true },
        { name: '📝 Razón', value: reason, inline: false },
      ];

      const embed = createSuccessEmbed(
        'Usuario Desbaneado',
        'El usuario ya puede unirse al servidor',
        fields
      );

      logger.info({ userId, reason }, 'Usuario desbaneado');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /unban');

      const embed = createErrorEmbed(
        'Error',
        error.message || 'No se pudo desbanear. Verifica que el usuario esté baneado.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
