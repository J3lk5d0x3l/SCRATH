// src/commands/unmute.js
// Comando /unmute: dessilencia a un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Dessilencia a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a dessilenciar')
        .setRequired(true)
    ),

  permissions: {
    user: ['MODERATE_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS', 'MODERATE_MEMBERS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'unmute',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const target = interaction.options.getUser('usuario');

      if (target.id === interaction.user.id) {
        const embed = createErrorEmbed(
          'Error',
          'No puedes desmutearte a ti mismo'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Audita
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_UNMUTED',
        resourceType: 'USER',
        resourceId: target.id,
        status: 'SUCCESS',
      });

      const fields = [
        { name: '👤 Usuario', value: `${target.username}`, inline: true },
        { name: '✅ Estado', value: 'Desmuteado', inline: true },
      ];

      const embed = createSuccessEmbed(
        'Usuario Desmuteado',
        `${target.username} ya puede hablar`,
        fields
      );

      logger.info({ targetId: target.id }, 'Usuario desmuteado');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /unmute');

      const embed = createErrorEmbed(
        'Error',
        'No se pudo remover el mute. Verifica permisos.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
