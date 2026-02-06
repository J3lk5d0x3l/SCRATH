// src/commands/info.js
// Comando /info: Info del servidor o usuario

import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';
import { formatTimestamp } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Muestra información del servidor o usuario')
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('tipo')
        .setDescription('¿Qué información deseas?')
        .setChoices(
          { name: 'Servidor', value: 'guild' },
          { name: 'Mi Perfil', value: 'user' }
        )
        .setRequired(true)
    ),

  permissions: {
    user: [],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 3,

  async execute(interaction) {
    const container = getService('config'); // Placeholder para obtener container
    const logger = getService('logger').child({
      command: 'info',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      const tipo = interaction.options.getString('tipo');

      if (tipo === 'guild') {
        return await handleGuildInfo(interaction, logger);
      } else if (tipo === 'user') {
        return await handleUserInfo(interaction, logger);
      }

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /info');

      const embed = createInfoEmbed(
        'Error',
        'No se pudo obtener la información. Intenta más tarde.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

async function handleGuildInfo(interaction, logger) {
  const guild = interaction.guild;

  const fields = [
    { name: '🆔 ID del Servidor', value: guild.id, inline: true },
    { name: '👥 Miembros', value: `${guild.memberCount}`, inline: true },
    { name: '📅 Creado', value: formatTimestamp(guild.createdAt), inline: false },
    { name: '🛡️ Nivel Verificación', value: `${guild.verificationLevel}`, inline: true },
    { name: '📢 Canales', value: `${guild.channels.cache.size}`, inline: true },
    { name: '👑 Propietario', value: `<@${guild.ownerId}>`, inline: true },
  ];

  const embed = createInfoEmbed(
    guild.name,
    guild.description || 'Información del servidor',
    fields
  );

  if (guild.icon) {
    embed.setThumbnail(guild.iconURL({ size: 256 }));
  }

  logger.debug({ guildId: guild.id }, 'Info del servidor mostrada');
  return interaction.reply({ embeds: [embed] });
}

async function handleUserInfo(interaction, logger) {
  const user = interaction.user;
  const member = interaction.member;

  const fields = [
    { name: '🆔 ID de Usuario', value: user.id, inline: true },
    { name: '📅 Cuenta Creada', value: formatTimestamp(user.createdAt), inline: true },
    { name: '📝 Etiqueta', value: `${user.username}#${user.discriminator || '0'}`, inline: true },
  ];

  if (member) {
    fields.push(
      { name: '⏰ Se Unió', value: formatTimestamp(member.joinedAt), inline: true },
      { name: '🎭 Apodo', value: member.nickname || 'Sin apodo', inline: true },
      { name: '🏷️ Roles', value: `${member.roles.cache.size - 1}`, inline: true }
    );
  }

  const embed = createInfoEmbed(
    `Información de ${user.username}`,
    'Detalles de tu perfil',
    fields
  );

  embed.setThumbnail(user.avatarURL({ size: 256 }));

  logger.debug({ userId: user.id }, 'Info del usuario mostrada');
  return interaction.reply({ embeds: [embed] });
}

export default command;
