import { Client, GatewayIntentBits, ActivityType, Partials } from 'discord.js';

export function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
    presence: {
      activities: [
        {
          name: '/help para comandos',
          type: ActivityType.Playing,
        },
      ],
      status: 'online',
    },
  });

  return client;
}

export { };
