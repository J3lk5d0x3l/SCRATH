/**
 * Validadores de entrada
 */

export function isValidDiscordId(id: string): boolean {
  return /^\d{17,19}$/.test(id);
}

export function isValidUsername(username: string): boolean {
  return !!(username && username.length > 0 && username.length <= 32);
}

export function isValidReason(reason: string): boolean {
  return !!(reason && reason.length > 0 && reason.length <= 512);
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 2000);
}

export function validateUserInput(input: string, maxLength = 2000): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'El texto no puede estar vacío' };
  }
  if (input.length > maxLength) {
    return { valid: false, error: `El texto excede el límite de ${maxLength} caracteres` };
  }
  return { valid: true };
}
