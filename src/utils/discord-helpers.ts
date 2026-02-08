import { type Guild, type GuildMember, type User } from 'discord.js';

/**
 * Helpers discord.js
 */

export function getGuildMemberDisplayName(member: GuildMember | null | undefined): string {
  if (!member) return 'Desconocido';
  return member.nickname || member.user.username;
}

export function getUserTag(user: User | null | undefined): string {
  if (!user) return 'Desconocido';
  return `${user.username}#${user.discriminator || '0000'}`;
}

export async function fetchMember(guild: Guild, userId: string) {
  try {
    return await guild.members.fetch(userId);
  } catch {
    return null;
  }
}

export async function fetchUser(client: any, userId: string) {
  try {
    return await client.users.fetch(userId);
  } catch {
    return null;
  }
}

export function isBot(user: User | null | undefined): boolean {
  return user?.bot === true;
}

export function isSelf(user: User | null | undefined, selfId: string): boolean {
  return user?.id === selfId;
}
