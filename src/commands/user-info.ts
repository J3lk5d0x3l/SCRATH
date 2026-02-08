import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder().setName('user-info').setDescription('Información de un usuario').addUserOption(o=>o.setName('usuario').setDescription('Usuario a consultar').setRequired(false)).setDMPermission(false),
  permissions: { user: [], bot: ['SendMessages', 'EmbedLinks'] },
  cooldown: 3,

  async execute(interaction: any) {
    const logger = getService('logger').child({ command: 'user-info', userId: interaction.user.id, guildId: interaction.guildId });
    try {
      const user = interaction.options.getUser('usuario') || interaction.user;
      const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(()=>null) : null;
      const embed = createInfoEmbed('Información de Usuario', `Usuario: **${user.tag}**\nID: **${user.id}**\nMiembro del servidor: **${member ? 'Sí' : 'No'}**`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.error({ err: error }, 'Error ejecutando /user-info');
      return interaction.reply({ content: 'No se pudo obtener la información del usuario.', ephemeral: true });
    }
  },
};

export default command;
