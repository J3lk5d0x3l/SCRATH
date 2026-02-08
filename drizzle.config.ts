import type { Config } from 'drizzle-kit';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'bot.db');

export default {
  schema: './src/database/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config;

