// src/database/client.js
// Cliente Prisma + inicialización

import { mkdirSync } from 'fs';
import { dirname } from 'path';
import logger from '../services/logger.js';

export async function initializePrisma(prisma) {
  try {
    // Asegura que la carpeta para SQLite exista si DATABASE_URL apunta a file:./path/db
    const raw = process.env.DATABASE_URL || '';
    if (raw.startsWith('file:')) {
      const filePath = raw.slice(5).replace(/^"|"$/g, '');
      const dir = dirname(filePath || './');
      try {
        if (dir && dir !== '.') {
          mkdirSync(dir, { recursive: true });
          logger.debug({ path: dir }, 'Carpeta de BD creada o verificada');
        }
      } catch (e) {
        logger.warn({ err: e, path: dir }, 'Advertencia al crear carpeta de BD (continuando)');
      }
    }

    // Verifica conexión: en SQLite las consultas SELECT deben usar $queryRaw
    await prisma.$queryRaw`SELECT 1`;
    logger.debug('Conexión a BD verificada');
    return prisma;
  } catch (error) {
    // Log claro de error para guiar al usuario
    if (error.code === 'ENOENT' || error.message.includes('no such table')) {
      logger.error(
        { err: error },
        'BD no accesible. Asegúrate de ejecutar: npm run db:generate && npm run db:migrate:dev'
      );
    } else if (error.message.includes('Prisma Client')) {
      logger.error(
        { err: error },
        'Prisma Client no generado. Ejecuta: npm run db:generate'
      );
    } else {
      logger.error({ err: error }, 'Error inicializando BD');
    }
    // Retorna prisma para permitir degradación segura
    return prisma;
  }
}

export { PrismaClient } from '@prisma/client';
