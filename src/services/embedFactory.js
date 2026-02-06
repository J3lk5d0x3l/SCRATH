// src/services/embedFactory.js
// Factory para crear embeds con estilos estándar (español)

import { EmbedBuilder } from 'discord.js';

const COLORS = {
  SUCCESS: 0x2ecc71, // Verde
  ERROR: 0xe74c3c, // Rojo
  INFO: 0x3498db, // Azul
  WARNING: 0xf39c12, // Naranja
  NEUTRAL: 0x95a5a6, // Gris
};

/**
 * Crea embed de éxito
 */
export function createSuccessEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Crea embed de error
 */
export function createErrorEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Crea embed de información
 */
export function createInfoEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Crea embed de advertencia
 */
export function createWarningEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Crea embed genérico
 */
export function createEmbed(title, description, color = COLORS.NEUTRAL, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Crea embed de lista (útil para /help)
 */
export function createListEmbed(title, items) {
  const description = items
    .map((item, idx) => `**${idx + 1}.** ${item}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Crea embed de campo (útil para stats)
 */
export function createFieldEmbed(title, fields) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(title)
    .setTimestamp();

  embed.addFields(fields);

  return embed;
}

export { COLORS };
