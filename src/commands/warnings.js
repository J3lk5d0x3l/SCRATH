// src/commands/warnings.js
// Comando /warnings: lista advertencias de un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed, createEmbed } from '../services/embedFactory.js';
import { formatTimestamp } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Muestra las advertencias de un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)
    ),

  permissions: {
    user: ['MODERATE_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'warnings',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      const target = interaction.options.getUser('usuario') || interaction.user;

      // Mock: en futuro desde service
      const warnings = [
        { id: '1', reason: 'Spam en chat', createdAt: new Date(Date.now() - 3600000) },
        { id: '2', reason: 'Lenguaje inapropiado', createdAt: new Date(Date.now() - 7200000) },
      ];

      if (warnings.length === 0) {
        const embed = createInfoEmbed(
          'Advertencias',
          `${target.username} no tiene advertencias`
        );
        return interaction.reply({ embeds: [embed] });
      }

      let description = warnings
        .map((w, idx) => {
          return `**${idx + 1}.** ${w.reason}\n⏰ ${formatTimestamp(w.createdAt)}`;
        })
        .join('\n\n');

      const embed = createEmbed(
        `Advertencias de ${target.username}`,
        description,
        0xf39c12,
        [
          {
            name: '⚠️ Total',
            value: `${warnings.length}`,
            inline: true,
          },
          {
            name: '🎯 Estado',
            value: warnings.length >= 3 ? '🚨 En riesgo de kick' : '✅ Activo',
            inline: true,
          },
        ]
      );

      logger.debug({ targetId: target.id, count: warnings.length }, 'Warnings mostrados');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /warnings');

      const embed = createInfoEmbed(
        'Error',
        'No se pudo obtener las advertencias.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
