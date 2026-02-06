// src/commands/config.js
// Comando /config: get y set de configuración

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getService } from '../core/container.js';
import { createInfoEmbed, createSuccessEmbed, createErrorEmbed } from '../services/embedFactory.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Gestiona la configuración del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Obtiene la configuración actual')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Cambia la configuración')
        .addStringOption(option =>
          option
            .setName('clave')
            .setDescription('Qué cambiar')
            .setChoices(
              { name: 'Prefix', value: 'prefix' },
              { name: 'Idioma', value: 'language' },
              { name: 'Logging', value: 'loggingEnabled' }
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('valor')
            .setDescription('Nuevo valor')
            .setRequired(true)
        )
    ),

  permissions: {
    user: ['MANAGE_GUILD'],
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'],
  },

  cooldown: 5,

  async execute(interaction) {
    const logger = getService('logger').child({
      command: 'config',
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });
    const configSystem = getService('config'); // Placeholder - obtener desde container en implementación
    const audit = getService('audit');

    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'get') {
        return await handleConfigGet(interaction, logger, audit);
      } else if (subcommand === 'set') {
        return await handleConfigSet(interaction, logger, audit);
      }
    } catch (error) {
      logger.error({ error }, 'Error en comando /config');

      const embed = createErrorEmbed(
        'Error',
        'No se pudo procesar la configuración. Intenta más tarde.'
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

async function handleConfigGet(interaction, logger, audit) {
  // Aquí se obtendría del system cuando esté en container
  const mockConfig = {
    prefix: '!',
    language: 'es',
    loggingEnabled: true,
  };

  const fields = [
    { name: '📝 Prefix', value: `\`${mockConfig.prefix}\``, inline: true },
    { name: '🌐 Idioma', value: `\`${mockConfig.language}\``, inline: true },
    { name: '📊 Logging', value: mockConfig.loggingEnabled ? '✅ Activado' : '❌ Desactivado', inline: true },
  ];

  const embed = createInfoEmbed(
    'Configuración del Servidor',
    'Ajustes actuales',
    fields
  );

  logger.debug('Config get mostrado');
  return interaction.reply({ embeds: [embed] });
}

async function handleConfigSet(interaction, logger, audit) {
  const clave = interaction.options.getString('clave');
  const valor = interaction.options.getString('valor');

  // Validaciones básicas (luego en system)
  if (clave === 'loggingEnabled' && !['true', 'false'].includes(valor.toLowerCase())) {
    const embed = createErrorEmbed(
      'Valor Inválido',
      'Logging debe ser `true` o `false`'
    );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  await audit.log({
    guildId: interaction.guildId,
    userId: interaction.user.id,
    action: 'SETTINGS_CHANGED',
    resourceType: 'GUILD_SETTINGS',
    resourceId: interaction.guildId,
    details: { clave, valor },
    status: 'SUCCESS',
  });

  const embed = createSuccessEmbed(
    'Configuración Actualizada',
    `**${clave}** ahora es: \`${valor}\``
  );

  logger.info({ clave, valor }, 'Config actualizada');
  return interaction.reply({ embeds: [embed] });
}

export default command;
