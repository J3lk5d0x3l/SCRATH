// src/commands/user-info.js
// Comando /user-info: info detallada de usuario

import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';
import { formatTimestamp } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('user-info')
    .setDescription('Muestra información detallada de un usuario')
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a consultar (por defecto: tú)')
        .setRequired(false)
    ),

  permissions: {
    user: [],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'user-info',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      const target = interaction.options.getUser('usuario') || interaction.user;
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      const fields = [
        { name: '🆔 ID de Usuario', value: target.id, inline: true },
        { name: '🤖 Bot', value: target.bot ? '✅ Sí' : '❌ No', inline: true },
        { name: '📅 Cuenta Creada', value: formatTimestamp(target.createdAt), inline: false },
      ];

      if (member) {
        const roleCount = member.roles.cache.size - 1; // Excluye @everyone
        const joinedAt = member.joinedAt ? formatTimestamp(member.joinedAt) : 'Desconocido';
        const nickname = member.nickname || 'Sin apodo';
        const isBot = member.user.bot ? '🤖 Bot' : '👤 Usuario';

        fields.push(
          { name: '📍 Se Unió', value: joinedAt, inline: false },
          { name: '🎭 Apodo', value: nickname, inline: true },
          { name: '🏷️ Roles', value: `${roleCount}`, inline: true },
          { name: '👑 Rol Más Alto', value: member.roles.highest.name || '@everyone', inline: true },
          { name: '🔴 Permisos Clave', value: member.permissions.has('ADMINISTRATOR') ? '✅ Administrador' : '⚙️ Miembro', inline: true }
        );

        if (member.premiumSince) {
          fields.push({
            name: '💎 Impulsor Desde',
            value: formatTimestamp(member.premiumSince),
            inline: true,
          });
        }
      }

      const embed = createInfoEmbed(
        `${target.username}${target.bot ? ' [BOT]' : ''}`,
        'Información del Usuario',
        fields
      );

      embed.setThumbnail(target.avatarURL({ size: 256 }));

      logger.debug({ targetId: target.id }, 'User info mostrada');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /user-info');

      const embed = createInfoEmbed(
        'Error',
        'No se pudo obtener la información del usuario.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
