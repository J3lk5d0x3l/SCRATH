// src/commands/logs.js
// Comando /logs: visualiza auditoría

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';
import { formatTimestamp, truncate } from '../utils/formatters.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Muestra el historial de auditoría')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('acción')
        .setDescription('Filtrar por tipo de acción (opcional)')
        .setChoices(
          { name: 'Comandos Ejecutados', value: 'COMMAND_EXECUTED' },
          { name: 'Configuración Cambiada', value: 'SETTINGS_CHANGED' },
          { name: 'Usuarios Advertidos', value: 'USER_WARNED' },
          { name: 'Usuarios Muteados', value: 'USER_MUTED' },
          { name: 'Usuarios Desmuteados', value: 'USER_UNMUTED' }
        )
        .setRequired(false)
    ),

  permissions: {
    user: ['MANAGE_GUILD'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'logs',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const audit = getService('audit');

    try {
      const actionFilter = interaction.options.getString('acción');

      // Obtiene logs (mock: en futuro desde service)
      // const logs = await audit.getGuildLogs(interaction.guildId, 25);

      // Mock data para demostración
      const logs = [
        {
          id: '1',
          action: 'COMMAND_EXECUTED',
          userId: '123456789',
          createdAt: new Date(Date.now() - 60000),
          resourceId: 'ping',
        },
        {
          id: '2',
          action: 'SETTINGS_CHANGED',
          userId: interaction.user.id,
          createdAt: new Date(Date.now() - 120000),
          details: JSON.stringify({ clave: 'prefix', valor: '!' }),
        },
      ];

      // Filtra si se solicita
      let filtered = logs;
      if (actionFilter) {
        filtered = logs.filter(l => l.action === actionFilter);
      }

      if (filtered.length === 0) {
        const embed = createInfoEmbed(
          'Auditoría',
          'No hay registros en el rango seleccionado.'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Construye embed
      let description = filtered
        .slice(0, 10)
        .map((log, idx) => {
          const action = log.action.replace(/_/g, ' ');
          const timestamp = formatTimestamp(log.createdAt);
          const resource = log.resourceId ? ` (\`${log.resourceId}\`)` : '';
          return `**${idx + 1}.** ${action}${resource}\n⏰ ${timestamp}`;
        })
        .join('\n\n');

      const embed = createInfoEmbed(
        'Auditoría del Servidor',
        description || 'Sin registros',
        [
          {
            name: '📊 Total de Registros',
            value: `${filtered.length}`,
            inline: true,
          },
          {
            name: '🔍 Filtro',
            value: actionFilter || 'Ninguno',
            inline: true,
          },
        ]
      );

      logger.debug({ count: filtered.length }, 'Logs mostrados');
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ err: error }, 'Error en comando /logs');

      const embed = createInfoEmbed(
        'Error',
        'No se pudo cargar la auditoría.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
