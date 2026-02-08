import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('warnings').setDescription('Muestra las advertencias de un usuario').addUserOption(o=>o.setName('usuario').setDescription('Usuario a consultar').setRequired(true)).setDMPermission(false),
  permissions: { user: [], bot: ['SendMessages', 'EmbedLinks'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'warnings', userId: interaction.user.id, guildId: interaction.guildId });
    const repositories = getService('repositories');

    try {
      const member = interaction.options.getUser('usuario');
      const rows = await repositories.listWarnings(interaction.guildId, member.id);

      if (!rows || rows.length === 0) {
        const embed = createInfoEmbed('Advertencias', `No se encontraron advertencias para ${member.tag}.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const items = rows.map((r: any, i: number) => `${i + 1}. ${r.reason} — <@${r.moderatorId}>`);
      const embed = createInfoEmbed('Advertencias', `Advertencias para ${member.tag}:`, [{ name: 'Listado', value: items.join('\n') }]);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /warnings');
      const embed = createErrorEmbed('Error', 'No se pudo obtener las advertencias. Intenta más tarde.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
