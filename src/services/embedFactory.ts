import { EmbedBuilder } from 'discord.js';

const COLORS = {
  SUCCESS: 0x2ecc71,
  ERROR: 0xe74c3c,
  INFO: 0x3498db,
  WARNING: 0xf39c12,
  NEUTRAL: 0x95a5a6,
} as const;

export function createSuccessEmbed(title: string, description: string, fields: any[] = []) {
  const embed = new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle(`✅ ${title}`).setDescription(description).setTimestamp();
  if (fields.length > 0) embed.addFields(fields as any);
  return embed;
}

export function createErrorEmbed(title: string, description: string, fields: any[] = []) {
  const embed = new EmbedBuilder().setColor(COLORS.ERROR).setTitle(`❌ ${title}`).setDescription(description).setTimestamp();
  if (fields.length > 0) embed.addFields(fields as any);
  return embed;
}

export function createInfoEmbed(title: string, description: string, fields: any[] = []) {
  const embed = new EmbedBuilder().setColor(COLORS.INFO).setTitle(`ℹ️ ${title}`).setDescription(description).setTimestamp();
  if (fields.length > 0) embed.addFields(fields as any);
  return embed;
}

export function createWarningEmbed(title: string, description: string, fields: any[] = []) {
  const embed = new EmbedBuilder().setColor(COLORS.WARNING).setTitle(`⚠️ ${title}`).setDescription(description).setTimestamp();
  if (fields.length > 0) embed.addFields(fields as any);
  return embed;
}

export function createEmbed(title: string, description: string, color = COLORS.NEUTRAL, fields: any[] = []) {
  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
  if (fields.length > 0) embed.addFields(fields as any);
  return embed;
}

export function createListEmbed(title: string, items: string[]) {
  const description = items.map((item, idx) => `**${idx + 1}.** ${item}`).join('\n');
  return new EmbedBuilder().setColor(COLORS.INFO).setTitle(title).setDescription(description).setTimestamp();
}

export function createFieldEmbed(title: string, fields: any[]) {
  const embed = new EmbedBuilder().setColor(COLORS.INFO).setTitle(title).setTimestamp();
  embed.addFields(fields as any);
  return embed;
}

export { COLORS };
