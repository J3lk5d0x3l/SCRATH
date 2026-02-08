import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Muestra la latencia del bot').setDMPermission(false),
  permissions: { user: [], bot: ['SEND_MESSAGES', 'EMBED_LINKS'] },
  cooldown: 2,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'ping', userId: interaction.user.id, guildId: interaction.guildId });

    try {
      const apiLatency = interaction.client.ws.ping;
      const timestamp = interaction.createdTimestamp;
      const now = Date.now();
      const roundTripLatency = now - timestamp;

      const fields = [
        { name: '🔗 API Latencia', value: `${apiLatency}ms`, inline: true },
        { name: '↔️ Round Trip', value: `${roundTripLatency}ms`, inline: true },
        { name: '📡 Estado', value: apiLatency > 200 ? '⚠️ Alto' : '✅ Normal', inline: true },
      ];

      const embed = createInfoEmbed('Latencia del Bot', 'Verificando conexión a Discord...', fields);

      logger.debug({ apiLatency, roundTripLatency }, 'Ping ejecutado');
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error en comando /ping');
      const embed = createInfoEmbed('Error', 'No se pudo verificar la latencia. Intenta más tarde.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
