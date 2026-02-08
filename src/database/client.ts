import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import config from '../core/config.js';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

let db: ReturnType<typeof drizzle> | null = null;

export function initializeDatabase() {
  if (db) return db;

  const file = config.databaseUrl.replace('file:', '');
  // Asegurar que la carpeta que contiene el archivo exista
  const dir = dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const sqlite = new Database(file, { readonly: false });
  db = drizzle(sqlite);
  return db;
}

export function getDatabase() {
  if (!db) throw new Error('Database no inicializada');
  return db;
}

export async function shutdownDatabase() {
  if (!db) return;
  try {
    // better-sqlite3 doesn't require explicit disconnect, but close file handle
    // @ts-ignore
    db.client?.close?.();
  } catch (e) {
    // ignore
  }
  db = null;
}
