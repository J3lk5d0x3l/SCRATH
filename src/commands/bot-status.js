// src/commands/bot-status.js
// Comando /bot-status: estadísticas del bot

import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';
import { formatDuration } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('bot-status')
    .setDescription('Muestra las estadísticas del bot')
    .setDMPermission(false),

  permissions: {
    user: [],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'bot-status',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const client = interaction.client;

    try {
      const uptime = client.uptime || 0;
      const ping = client.ws.ping;
      const guilds = client.guilds.cache.size;
      const users = client.users.cache.size;
      const commands = client.commands?.size || 0;

      // Calcula memoria
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

      const uptimeFormatted = formatDuration(uptime);

      const fields = [
        { name: '⏱️ Tiempo Activo', value: uptimeFormatted, inline: true },
        { name: '🔗 Ping', value: `${ping}ms`, inline: true },
        { name: '📊 Versión', value: '1.0.0 (Fase 4)', inline: true },
        { name: '🏢 Servidores', value: `${guilds}`, inline: true },
        { name: '👥 Usuarios Únicos', value: `${users}`, inline: true },
        { name: '⚡ Comandos', value: `${commands}`, inline: true },
        { name: '💾 Memoria (Heap)', value: `${heapUsedMB}MB / ${heapTotalMB}MB`, inline: true },
        { name: '🔧 Node.js', value: `${process.version}`, inline: true },
        { name: '🌐 Discord API', value: 'v10 (discord.js 14.25.1)', inline: true },
      ];

      const statusEmoji = ping > 200 ? '⚠️' : '✅';
      const embed = createInfoEmbed(
        `${statusEmoji} Estado del Bot`,
        'Estadísticas en Tiempo Real',
        fields
      );

      embed.setFooter({ text: 'Enterprise Discord Bot - Fase 4' });

      logger.debug({ guilds, ping, uptime }, 'Bot status mostrado');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ error }, 'Error en comando /bot-status');

      const embed = createInfoEmbed(
        'Error',
        'No se pudo obtener el estado del bot.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
