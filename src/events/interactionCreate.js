// src/events/interactionCreate.js
// Event handler: enruta slash commands y context menus

import { getService } from '../core/container.js';
import { createErrorEmbed } from '../services/embedFactory.js';

const event = {
  name: 'interactionCreate',

  async execute(interaction) {
    const logger = getService('logger').child({
      userId: interaction.user?.id,
      guildId: interaction.guildId,
      type: interaction.type,
    });

    try {
      // Slash Commands
      if (interaction.isChatInputCommand()) {
        return await handleSlashCommand(interaction, logger);
      }

      // Context Menus (futuros)
      if (interaction.isContextMenuCommand()) {
        logger.debug({ command: interaction.commandName }, 'Context menu recibido (no implementado)');
        return;
      }

      // Auto-complete (futuro)
      if (interaction.isAutocomplete()) {
        logger.debug({ command: interaction.commandName }, 'Autocomplete recibido (no implementado)');
        return;
      }
    } catch (error) {
      logger.error({ err: error }, 'Error en interactionCreate');

      // Intenta responder al usuario
      try {
        const embed = createErrorEmbed(
          'Error',
          'Ocurrió un error procesando tu solicitud. Intenta más tarde.'
        );

        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error({ err: replyError }, 'No se pudo responder al usuario');
      }
    }
  },
};

async function handleSlashCommand(interaction, logger) {
  const rateLimit = getService('rateLimit');
  const audit = getService('audit');
  const commands = interaction.client.commands || new Map();

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.warn({ command: interaction.commandName }, 'Comando no encontrado');

    const embed = createErrorEmbed(
      'Comando No Encontrado',
      `El comando \`/${interaction.commandName}\` no existe.`
    );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  try {
    // Rate limiting
    const rlCheck = rateLimit.checkCommand(interaction.commandName, interaction.user.id);
    if (!rlCheck.allowed) {
      const resetTime = Math.ceil((rlCheck.resetTime - Date.now()) / 1000);
      const embed = createErrorEmbed(
        'Cooldown',
        `Espera **${resetTime}s** antes de usar este comando nuevamente.`
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    logger.debug(
      { command: interaction.commandName, cooldown: command.cooldown },
      'Ejecutando comando'
    );

    // Audita ejecución
    await audit.log({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      action: 'COMMAND_EXECUTED',
      resourceType: 'COMMAND',
      resourceId: interaction.commandName,
      status: 'SUCCESS',
    });

    // Ejecuta comando
    await command.execute(interaction);

  } catch (error) {
    logger.error(
      { err: error, command: interaction.commandName },
      'Error ejecutando comando'
    );

    // Audita error
    await audit.log({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      action: 'COMMAND_EXECUTED',
      resourceType: 'COMMAND',
      resourceId: interaction.commandName,
      status: 'FAILED',
      errorMessage: error.message,
    });

    const embed = createErrorEmbed(
      'Error',
      'Ocurrió un error ejecutando el comando. Intenta más tarde.'
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

export default event;
