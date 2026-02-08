import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('ban').setDescription('Banear usuario del servidor').addUserOption(opt => opt.setName('usuario').setDescription('Usuario a banear').setRequired(true)).addStringOption(opt => opt.setName('razon').setDescription('Razón').setRequired(false)).setDMPermission(false),
  permissions: { user: ['BanMembers'], bot: ['BanMembers'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'ban', userId: interaction.user.id, guildId: interaction.guildId });
    const rateLimit = getService('rateLimit');
    const backpressure = getService('backpressure');

    if (!backpressure.tryAcquire(interaction.guildId, interaction.user.id)) {
      return interaction.reply({ content: 'El sistema está ocupado. Intenta de nuevo en unos segundos.', ephemeral: true });
    }

    try {
      const rl = rateLimit.checkCommand('ban', interaction.user.id);
      if (!rl.allowed) {
        return interaction.reply({ content: 'Has alcanzado el límite de uso del comando. Intenta más tarde.', ephemeral: true });
      }

      const member = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón proporcionada';
      const guild = interaction.guild;

      const target = await guild.members.fetch(member.id).catch(() => null);
      if (!target) return interaction.reply({ content: 'Usuario no encontrado en el servidor.', ephemeral: true });

      await target.ban({ days: 1, reason });

      // Auditoría
      const audit = getService('audit');
      await audit.log({ guildId: interaction.guildId, userId: interaction.user.id, action: 'BAN', details: { target: member.id, reason } });

      const embed = createSuccessEmbed('Usuario baneado', `Se ha baneado a ${member.tag}.`, []);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /ban');
      const embed = createErrorEmbed('Error', 'No se pudo banear al usuario. Asegúrate de que tengo permisos y que el usuario es moderable.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } finally {
      backpressure.release(interaction.guildId, interaction.user.id);
    }
  },
};

export default command;
