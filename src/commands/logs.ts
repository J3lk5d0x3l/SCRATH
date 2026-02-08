import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('logs').setDescription('Mostrar logs de auditoría del servidor').setDMPermission(false),
  permissions: { user: [], bot: ['SendMessages', 'EmbedLinks'] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'logs', userId: interaction.user.id, guildId: interaction.guildId });
    const audit = getService('audit');

    try {
      const rows = await audit.getGuildLogs(interaction.guildId, 10);
      if (!rows || rows.length === 0) return interaction.reply({ content: 'No se encontraron logs para este servidor.', ephemeral: true });

      const items = rows.map((r: any) => `${r.action} • ${r.createdAt}`);
      const embed = createInfoEmbed('Logs de Auditoría', `Últimas acciones:`, [{ name: 'Listado', value: items.join('\n') }]);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /logs');
      return interaction.reply({ content: 'No se pudieron obtener los logs.', ephemeral: true });
    }
  },
};

export default command;
