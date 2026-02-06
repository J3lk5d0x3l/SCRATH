// src/commands/warn.js
// Comando /warn: advierte a un usuario

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed, createWarningEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a advertir')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razón')
        .setDescription('Razón de la advertencia')
        .setRequired(true)
    ),

  permissions: {
    user: ['MODERATE_MEMBERS'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'warn',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const target = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razón');

      if (target.id === interaction.user.id) {
        const embed = createErrorEmbed(
          'Error',
          'No puedes advertirte a ti mismo'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (reason.length > 500) {
        const embed = createErrorEmbed(
          'Razón Muy Larga',
          'La razón no puede exceder 500 caracteres'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Audita
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'USER_WARNED',
        resourceType: 'USER',
        resourceId: target.id,
        details: { reason },
        status: 'SUCCESS',
      });

      // Simulación: contar warnings (en futuro, desde system)
      const totalWarnings = 1; // Mock
      const autoAction = totalWarnings >= 3 ? 'KICK' : null;

      const fields = [
        { name: '👤 Usuario', value: `${target.username}`, inline: true },
        { name: '⚠️ Advertencias', value: `${totalWarnings}`, inline: true },
        { name: '📝 Razón', value: reason, inline: false },
      ];

      if (autoAction) {
        fields.push({
          name: '🚨 Auto-Acción',
          value: `Se aplicará: **${autoAction}**`,
          inline: false,
        });
      }

      const embed = totalWarnings >= 3
        ? createWarningEmbed('Usuario Advertido (LÍMITE)', `${target.username}`, fields)
        : createSuccessEmbed('Usuario Advertido', `${target.username}`, fields);

      logger.info({ targetId: target.id, totalWarnings }, 'Usuario advertido');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /warn');

      const embed = createErrorEmbed(
        'Error',
        'No se pudo registrar la advertencia.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
