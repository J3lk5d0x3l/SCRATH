// src/commands/automod.js
// Configure auto-moderation rules

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configura la auto-moderación del servidor')
    .setDMPermission(false)
    .addSubcommand(sub =>
      sub
        .setName('status')
        .setDescription('Ver estado de auto-moderación')
    )
    .addSubcommand(sub =>
      sub
        .setName('enable')
        .setDescription('Habilitar una regla')
        .addStringOption(opt =>
          opt
            .setName('regla')
            .setDescription('Tipo de regla')
            .setRequired(true)
            .addChoices(
              { name: 'Spam', value: 'spam' },
              { name: 'Invitaciones', value: 'invites' },
              { name: 'Menciones excesivas', value: 'mentions' },
              { name: 'Mayúsculas', value: 'caps' }
            )
        )
        .addStringOption(opt =>
          opt
            .setName('accion')
            .setDescription('Acción a ejecutar')
            .setRequired(true)
            .addChoices(
              { name: 'Advertir', value: 'warn' },
              { name: 'Silenciar', value: 'mute' },
              { name: 'Expulsar', value: 'kick' },
              { name: 'Eliminar mensaje', value: 'delete' }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('disable')
        .setDescription('Deshabilitar una regla')
        .addStringOption(opt =>
          opt
            .setName('regla')
            .setDescription('Tipo de regla')
            .setRequired(true)
            .addChoices(
              { name: 'Spam', value: 'spam' },
              { name: 'Invitaciones', value: 'invites' },
              { name: 'Menciones excesivas', value: 'mentions' },
              { name: 'Mayúsculas', value: 'caps' }
            )
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  permissions: {
    user: ['MANAGE_GUILD'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 3,

  async execute(interaction) {
    const logger = getService('logger');
    const audit = getService('audit');
    const rateLimit = getService('rateLimit');
    const embedFactory = getService('embedFactory');
    const autoModSystem = getService('autoModSystem');

    const childLog = logger.child({
      command: 'automod',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    try {
      // Rate limit
      const rateLimitCheck = rateLimit.checkCommand('automod', interaction.user.id);
      if (!rateLimitCheck.allowed) {
        const cooldown = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
        const embed = embedFactory.createErrorEmbed(
          '⏱ Cooldown',
          `Espera ${cooldown}s`
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'status') {
        // Get current automod config
        const config = await autoModSystem.getAutoModConfig(interaction.guildId);
        
        const fields = Object.entries(config.rules).map(([trigger, rule]) => ({
          name: `${rule.enabled ? '✅' : '❌'} ${trigger}`,
          value: `Acción: ${rule.action} | Umbral: ${rule.threshold}`,
          inline: true,
        }));

        const embed = embedFactory.createInfoEmbed(
          '🤖 Estado de Auto-Moderación',
          'Reglas actuales del servidor'
        );
        embed.fields = fields;

        childLog.info('📋 Status solicitado');
        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'enable') {
        const trigger = interaction.options.getString('regla');
        const action = interaction.options.getString('accion');

        const updated = await autoModSystem.updateAutoModRule(interaction.guildId, trigger, {
          enabled: true,
          action,
          threshold: 1,
        });

        childLog.info({ trigger, action }, '✅ Regla habilitada');

        await audit.log({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          action: 'AUTOMOD_UPDATED',
          resourceType: 'AUTOMOD',
          details: { trigger, action, enabled: true },
          status: 'SUCCESS',
        });

        const embed = embedFactory.createSuccessEmbed(
          '✅ Auto-moderación actualizada',
          `Regla **${trigger}** habilitada con acción: **${action}**`
        );
        return interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'disable') {
        const trigger = interaction.options.getString('regla');

        await autoModSystem.updateAutoModRule(interaction.guildId, trigger, {
          enabled: false,
        });

        childLog.info({ trigger }, '❌ Regla deshabilitada');

        await audit.log({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          action: 'AUTOMOD_UPDATED',
          resourceType: 'AUTOMOD',
          details: { trigger, enabled: false },
          status: 'SUCCESS',
        });

        const embed = embedFactory.createSuccessEmbed(
          '✅ Regla deshabilitada',
          `La regla **${trigger}** ha sido deshabilitada`
        );
        return interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      childLog.error(error, 'Error en automod');

      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'AUTOMOD_UPDATED',
        status: 'FAILED',
        errorMessage: error.message,
      });

      const embed = embedFactory.createErrorEmbed(
        '❌ Error',
        'No se pudo actualizar la auto-moderación'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
