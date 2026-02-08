import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('kick').setDescription('Expulsar usuario del servidor').addUserOption(o => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true)).addStringOption(o=>o.setName('razon').setDescription('Razón').setRequired(false)).setDMPermission(false),
  permissions: { user: ['KickMembers'], bot: ['KickMembers'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'kick', userId: interaction.user.id, guildId: interaction.guildId });
    const rateLimit = getService('rateLimit');
    const backpressure = getService('backpressure');

    if (!backpressure.tryAcquire(interaction.guildId, interaction.user.id)) {
      return interaction.reply({ content: 'El sistema está ocupado. Intenta de nuevo en unos segundos.', ephemeral: true });
    }

    try {
      const rl = rateLimit.checkCommand('kick', interaction.user.id);
      if (!rl.allowed) return interaction.reply({ content: 'Has alcanzado el límite de uso del comando. Intenta más tarde.', ephemeral: true });

      const member = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón proporcionada';
      const guild = interaction.guild;
      const target = await guild.members.fetch(member.id).catch(() => null);
      if (!target) return interaction.reply({ content: 'Usuario no encontrado en el servidor.', ephemeral: true });

      await target.kick(reason);

      const audit = getService('audit');
      await audit.log({ guildId: interaction.guildId, userId: interaction.user.id, action: 'KICK', details: { target: member.id, reason } });

      const embed = createSuccessEmbed('Usuario expulsado', `Se ha expulsado a ${member.tag}.`, []);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /kick');
      const embed = createErrorEmbed('Error', 'No se pudo expulsar al usuario. Verifica permisos.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } finally {
      backpressure.release(interaction.guildId, interaction.user.id);
    }
  },
};

export default command;
