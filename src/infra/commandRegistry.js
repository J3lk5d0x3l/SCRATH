// src/infra/commandRegistry.js
// Carga dinámicamente todos los comandos de src/commands

import logger from '../services/logger.js';
import config from '../core/config.js';
import { Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Carga todos los comandos de src/commands
 */
export async function loadCommands() {
  const commands = new Collection();
  const commandPath = join(__dirname, '../commands');

  try {
    const files = await readdir(commandPath);
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.startsWith('.'));

    logger.info({ count: jsFiles.length }, 'Cargando comandos...');

    for (const file of jsFiles) {
      try {
        const command = await import(`../commands/${file}`);
        const commandModule = command.default || command;

        if (!commandModule.data || !commandModule.execute) {
          logger.warn({ file }, 'Comando sin metadata (data/execute)');
          continue;
        }

        const commandName = commandModule.data.name;
        commands.set(commandName, commandModule);
        logger.debug({ command: commandName }, 'Comando cargado');
      } catch (error) {
        logger.error({ file, err: error }, 'Error cargando comando');
      }
    }

    logger.info({ total: commands.size }, 'Comandos cargados correctamente');
    return commands;
  } catch (error) {
    logger.error({ err: error }, 'Error en registry de comandos');
    throw error;
  }
}

/**
 * Registra slash commands en Discord (guild o global según entorno)
 * - DEVELOPMENT: registra en GUILD_ID si está configurado (rápido, sin latencia de 30 min)
 * - PRODUCTION: registra global
 */
export async function registerSlashCommands(client, commands) {
  try {
    const commandData = commands.map(cmd => cmd.data.toJSON());
    const isDevelopment = config.environment === 'development';
    const hasGuildId = config.guildId && config.guildId.trim().length > 0;

    if (isDevelopment && hasGuildId) {
      // DEVELOPMENT: Registra en un guild específico (rápido, ideal para testing)
      logger.info(
        { count: commandData.length, guildId: config.guildId },
        'Registrando slash commands en guild de desarrollo...'
      );
      try {
        const guild = await client.guilds.fetch(config.guildId);
        await guild.commands.set(commandData);
        logger.info(
          { guildId: config.guildId, count: commandData.length },
          'Slash commands registrados en guild de desarrollo (sin latencia de 30 min)'
        );
      } catch (guildError) {
        logger.error(
          { err: guildError, guildId: config.guildId },
          'Error registrando en guild; reintentando global...'
        );
        // Fallback a global
        await client.application.commands.set(commandData);
        logger.info(
          { count: commandData.length },
          'Slash commands registrados globalmente (fallback)'
        );
      }
    } else {
      // PRODUCTION o DEVELOPMENT sin GUILD_ID: Registra global (30 min de latencia)
      const env = isDevelopment ? 'desarrollo sin guild' : 'producción';
      logger.info(
        { count: commandData.length, environment: env },
        'Registrando slash commands globalmente...'
      );
      await client.application.commands.set(commandData);
      logger.info(
        { count: commandData.length },
        'Slash commands registrados globalmente (latencia de ~30 minutos)'
      );
    }
  } catch (error) {
    logger.error({ err: error }, 'Error registrando slash commands');
    throw error;
  }
}
