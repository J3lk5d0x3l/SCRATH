import logger from '../services/logger.js';
import config from '../core/config.js';
import { Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';

const isTS = process.env.NODE_ENV !== 'production';

export async function loadCommands() {
  const commands = new Collection<string, any>();
  const commandPath = join(process.cwd(), 'src', 'commands');

  try {
    const files = await readdir(commandPath);
    const ext = isTS ? '.ts' : '.js';
    const jsFiles = files.filter((f) => f.endsWith(ext) && !f.startsWith('.'));

    logger.info({ count: jsFiles.length }, 'Cargando comandos...');

    for (const file of jsFiles) {
      try {
        const modulePath = `../commands/${file}`;
        const command = await import(modulePath);
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

export async function registerSlashCommands(client: any, commands: Collection<string, any>) {
  try {
    const commandData = commands.map((cmd) => cmd.data.toJSON());
    const isDevelopment = config.environment === 'development';
    const hasGuildId = !!(config.guildId && config.guildId.trim().length > 0);

    if (isDevelopment && hasGuildId) {
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
        logger.error({ err: guildError, guildId: config.guildId }, 'Error registrando en guild; reintentando global...');
        await client.application.commands.set(commandData);
        logger.info({ count: commandData.length }, 'Slash commands registrados globalmente (fallback)');
      }
    } else {
      const env = isDevelopment ? 'desarrollo sin guild' : 'producción';
      logger.info({ count: commandData.length, environment: env }, 'Registrando slash commands globalmente...');
      await client.application.commands.set(commandData);
      logger.info({ count: commandData.length }, 'Slash commands registrados globalmente (latencia de ~30 minutos)');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error registrando slash commands');
    throw error;
  }
}
