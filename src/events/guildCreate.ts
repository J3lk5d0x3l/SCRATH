import { getService } from '../core/container.js';

const event = {
  name: 'guildCreate',

  async execute(guild: any) {
    const logger = getService('logger').child({ guildId: guild.id, type: 'guildCreate' });
    const repositories = getService('repositories');
    const audit = getService('audit');

    try {
      // Crea/actualiza registro del guild
      await repositories.getOrCreateGuild(guild.id, guild.name, guild.iconURL() || undefined);

      // Crea settings por defecto si no existen
      const existing = await repositories.getGuildSettingsByGuildId(guild.id);
      if (!existing) {
        await repositories.upsertGuildSettings(guild.id, {
          prefix: '!',
          language: 'es',
          loggingEnabled: true,
          automodEnabled: false,
        });
      }

      // Audita
      await audit.log({
        guildId: guild.id,
        action: 'GUILD_JOINED',
        details: { guildName: guild.name, memberCount: guild.memberCount },
      });

      logger.info({ guildName: guild.name, memberCount: guild.memberCount }, '🎉 Bot añadido a un nuevo servidor');
    } catch (error) {
      logger.error({ err: error }, 'Error en guildCreate');
    }
  },
};

export default event;
