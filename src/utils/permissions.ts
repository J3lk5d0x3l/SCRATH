import { PermissionsBitField, type User, type Guild, type GuildMember } from 'discord.js';

/**
 * Verificadores de permisos Discord
 */

export function hasPermission(member: GuildMember | null | undefined, permission: bigint): boolean {
  if (!member) return false;
  return member.permissions.has(permission);
}

export function hasAnyPermission(member: GuildMember | null | undefined, permissions: bigint[]): boolean {
  if (!member) return false;
  return permissions.some((p) => member.permissions.has(p));
}

export function hasAllPermissions(member: GuildMember | null | undefined, permissions: bigint[]): boolean {
  if (!member) return false;
  return permissions.every((p) => member.permissions.has(p));
}

export function botCanModerate(targetMember: GuildMember, botMember: GuildMember): boolean {
  // El bot debe tener rol más alto que el objetivo
  if (!botMember || !targetMember) return false;
  return botMember.roles.highest.position > targetMember.roles.highest.position;
}

export function userCanModerate(actor: GuildMember, target: GuildMember): boolean {
  // El actor debe tener rol más alto que el objetivo
  if (!actor || !target) return false;
  return actor.roles.highest.position > target.roles.highest.position;
}

export const MODERATION_PERMISSIONS = [
  PermissionsBitField.Flags.BanMembers,
  PermissionsBitField.Flags.KickMembers,
  PermissionsBitField.Flags.ManageMessages,
  PermissionsBitField.Flags.MuteMembers,
];
