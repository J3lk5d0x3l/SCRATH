import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Advertir a un usuario').addUserOption(o=>o.setName('usuario').setDescription('Usuario a advertir').setRequired(true)).addStringOption(o=>o.setName('razon').setDescription('Razón').setRequired(false)).setDMPermission(false),
  permissions: { user: ['ManageMessages'], bot: ['SendMessages'] },
  cooldown: 2,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'warn', userId: interaction.user.id, guildId: interaction.guildId });
    const repositories = getService('repositories');
    const rateLimit = getService('rateLimit');
    const backpressure = getService('backpressure');

    if (!backpressure.tryAcquire(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'El sistema está ocupado. Intenta de nuevo en unos segundos.', ephemeral: true });

    try {
      const rl = rateLimit.checkCommand('warn', interaction.user.id);
      if (!rl.allowed) return interaction.reply({ content: 'Has alcanzado el límite de uso del comando. Intenta más tarde.', ephemeral: true });

      const member = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón proporcionada';

      await repositories.addWarning(interaction.guildId, member.id, interaction.user.id, reason);

      const audit = getService('audit');
      await audit.log({ guildId: interaction.guildId, userId: interaction.user.id, action: 'WARN', details: { target: member.id, reason } });

      const embed = createSuccessEmbed('Usuario advertido', `Se advirtió a ${member.tag}.`, []);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /warn');
      const embed = createErrorEmbed('Error', 'No se pudo emitir la advertencia. Intenta más tarde.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } finally {
      backpressure.release(interaction.guildId, interaction.user.id);
    }
  },
};

export default command;
