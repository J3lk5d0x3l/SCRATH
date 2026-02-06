// src/infra/client.js
// Setup Discord client con intents y gateway

import { Client, GatewayIntentBits, PermissionsBitField, ActivityType, Partials } from 'discord.js';

/**
 * Crea y configura Discord client
 */
export function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel], // Necesario para DirectMessages cache
    presence: {
      activities: [{
        name: '/help para comandos',
        type: ActivityType.Playing,
      }],
      status: 'online',
    },
  });

  return client;
}

/**
 * Exporta PermissionsBitField para uso en comandos
 */
export { PermissionsBitField };
