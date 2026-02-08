/**
 * Utilidades de formateo para respuestas
 */

export function formatUserTag(userId: string, username?: string): string {
  return username ? `${username} (${userId})` : userId;
}

export function formatTimeSpan(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día(s)`;
  if (hours > 0) return `${hours} hora(s)`;
  if (minutes > 0) return `${minutes} minuto(s)`;
  return `${seconds} segundo(s)`;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return date.toLocaleString('es-AR');
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
