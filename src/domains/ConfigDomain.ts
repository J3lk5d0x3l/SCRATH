/**
 * ConfigDomain: Lógica pura de configuración
 */

export interface GuildConfig {
  prefix: string;
  language: string;
  loggingEnabled: boolean;
  automodEnabled: boolean;
}

export const DEFAULT_CONFIG: GuildConfig = {
  prefix: '!',
  language: 'es',
  loggingEnabled: true,
  automodEnabled: false,
};

export function isValidPrefix(prefix: string): boolean {
  return !!(prefix && prefix.length > 0 && prefix.length <= 10);
}

export function isValidLanguage(lang: string): boolean {
  return ['es', 'en'].includes(lang);
}
