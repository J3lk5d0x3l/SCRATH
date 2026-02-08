import { randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function isValidId(id: string): boolean {
  // UUID v4 format check (básico)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
