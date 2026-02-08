import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('help').setDescription('Muestra la lista de comandos disponibles').setDMPermission(false),
  permissions: { user: [], bot: ['SEND_MESSAGES', 'EMBED_LINKS'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'help', userId: interaction.user.id, guildId: interaction.guildId });

    try {
      const commands = interaction.client.commands || new Map();
      if (commands.size === 0) {
        const embed = createInfoEmbed('Ayuda', 'No hay comandos disponibles en este momento.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const categories = new Map<string, string[]>();
      for (const [name, cmd] of commands) {
        const category = cmd.category || 'General';
        if (!categories.has(category)) categories.set(category, []);
        categories.get(category)!.push(name);
      }

      const fields: any[] = [];
      for (const [category, cmds] of categories) {
        fields.push({ name: `📂 ${category}`, value: cmds.map((c) => `\`/${c}\``).join(', '), inline: false });
      }

      const embed = createInfoEmbed('Comandos Disponibles', `Usa \`/help\` para ver esta lista. Total de comandos: **${commands.size}**`, fields);
      logger.debug({ commandCount: commands.size }, 'Mostrando ayuda');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error en comando /help');
      const embed = createErrorEmbed('Error', 'No se pudo cargar la lista de comandos. Intenta más tarde.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
