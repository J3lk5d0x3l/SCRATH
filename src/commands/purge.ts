import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('purge').setDescription('Limpiar mensajes').addIntegerOption(o=>o.setName('cantidad').setDescription('Cantidad de mensajes (2-100)').setRequired(true)).setDMPermission(false),
  permissions: { user: ['ManageMessages'], bot: ['ManageMessages'] },
  cooldown: 5,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'purge', userId: interaction.user.id, guildId: interaction.guildId });
    const backpressure = getService('backpressure');
    if (!backpressure.tryAcquire(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'El sistema está ocupado. Intenta de nuevo en unos segundos.', ephemeral: true });

    try {
      const amount = interaction.options.getInteger('cantidad');
      if (!amount || amount < 2 || amount > 100) return interaction.reply({ content: 'La cantidad debe estar entre 2 y 100.', ephemeral: true });

      const fetched = await interaction.channel.messages.fetch({ limit: amount });
      await interaction.channel.bulkDelete(fetched, true);

      const embed = createSuccessEmbed('Purge', `Se eliminaron ${fetched.size} mensajes.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /purge');
      const embed = createErrorEmbed('Error', 'No se pudieron eliminar los mensajes. Asegúrate de los permisos y de que los mensajes tengan menos de 14 días.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } finally {
      backpressure.release(interaction.guildId, interaction.user.id);
    }
  },
};

export default command;
