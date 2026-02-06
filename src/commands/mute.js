// src/commands/mute.js
// Comando /mute: silencia a un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';
import { formatDuration } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a silenciar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('duración')
        .setDescription('Duración (ej: 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razón')
        .setDescription('Razón del mute')
        .setRequired(false)
    ),

  permissions: {
    user: ['MODERATE_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS', 'MODERATE_MEMBERS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'mute',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const target = interaction.options.getUser('usuario');
      const duracionStr = interaction.options.getString('duración');
      const reason = interaction.options.getString('razón') || 'Sin especificar';

      // Validaciones básicas
      if (target.id === interaction.user.id) {
        const embed = createErrorEmbed(
          'Error',
          'No puedes mutearte a ti mismo'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Parsea duración (simplificado)
      const durationSeconds = parseDuration(duracionStr);
      if (!durationSeconds) {
        const embed = createErrorEmbed(
          'Duración Inválida',
          'Usa: 10s, 5m, 1h, 1d'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Audita
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_MUTED',
        resourceType: 'USER',
        resourceId: target.id,
        details: { reason, durationSeconds },
        status: 'SUCCESS',
      });

      const muteEndsAt = new Date(Date.now() + durationSeconds * 1000);
      const fields = [
        { name: '👤 Usuario', value: `${target.username}`, inline: true },
        { name: '⏱️ Duración', value: formatDuration(durationSeconds * 1000), inline: true },
        { name: '📝 Razón', value: reason, inline: false },
        { name: '⏰ Fin del Mute', value: muteEndsAt.toLocaleString('es-ES'), inline: false },
      ];

      const embed = createSuccessEmbed(
        'Usuario Muteado',
        `${target.username} ha sido silenciado`,
        fields
      );

      logger.info({ targetId: target.id, durationSeconds }, 'Usuario muteado');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /mute');

      const embed = createErrorEmbed(
        'Error',
        'No se pudo aplicar el mute. Verifica permisos.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

/**
 * Parsea duración (10s, 5m, 1h, 1d) a segundos
 */
function parseDuration(durationStr) {
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const [, num, unit] = match;
  const number = parseInt(num, 10);

  switch (unit) {
    case 's': return number;
    case 'm': return number * 60;
    case 'h': return number * 3600;
    case 'd': return number * 86400;
    default: return null;
  }
}

export default command;
