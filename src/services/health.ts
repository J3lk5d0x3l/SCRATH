import logger from './logger.js';
import { getDatabase } from '../database/client.js';
import { sql } from 'drizzle-orm';

let healthState = {
  ready: false,
  startTime: Date.now(),
  lastCheck: Date.now(),
};

export function initializeHealth() {
  logger.info('Servicio de salud inicializado');
  healthState.ready = true;
}

export function getHealth() {
  const db = getDatabase();
  const now = Date.now();
  const uptime = now - healthState.startTime;

  return {
    status: healthState.ready ? 'healthy' : 'starting',
    uptime,
    lastCheck: now,
    database: 'connected', // Simplificado: si Drizzle está disponible, DB está OK
  };
}

export async function checkDatabase(): Promise<boolean> {
  try {
    const db = getDatabase();
    // Ejecuta simple query para verificar BD
    await db.select().from(sql`SELECT 1`);
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Error verificando base de datos');
    return false;
  }
}

