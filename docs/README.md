# README - Enterprise Discord Bot

Bot Discord modular, escalable, enterprise-ready. **Versión 2.0.0+: 100% TypeScript, Drizzle ORM, Resiliencia Anti-Spam Real.**

## Características

Resumen de la arquitectura y componentes implementados:

- **100% TypeScript (ESM)** - Strict mode, NodeNext module resolution
- **Drizzle ORM + SQLite** - better-sqlite3 driver, 10 tablas con índices
- Arquitectura modular por capas (core, infra, domains, systems, commands, events, services)
- Logger estructurado (Pino, 100% Español)
- Auditoría integrada (fail-safe, nunca crashea)
- **Rate Limiting** - 3 niveles (global, guild, user, command cooldown)
- **Backpressure** - Semáforo 3-tiers (max 50 global, 10 guild, 3 user concurrentes)
- **Timeouts** - 30s default con exponential backoff retry
- **Error Boundaries** - Process level + interaction level (nunca crashea por comando fallido)
- Feature flags runtime (con cache + overrides per-guild)
- ESM puro, sin require()
- Preparado para sharding (sistema en `src/systems/ShardingSystem.ts`)
- 17 comandos con protecciones
- 4 event handlers con error handling
- 10 tablas de persistencia (users, guilds, guildSettings, guildMembers, warnings, bans, auditLogs, featureFlags, featureFlagOverrides, state)

## Stack Requerido

- Node.js 20.20+
- discord.js 14.25.1
- TypeScript 5.5.2
- Drizzle ORM 0.30.0
- better-sqlite3 8.5.0
- Pino 9.6.0
- tsx (TypeScript executor, devDep)

## Instalación Rápida (mínimo)

```bash
# 1. Instala dependencias
npm install

# 2. Copia .env.example a .env y completa las variables obligatorias
cp .env.example .env
# Asegúrate de definir:
#   DISCORD_TOKEN: token de tu bot en Discord Developer Portal
#   DATABASE_URL: ruta SQLite (por defecto: file:./prisma/bot.db)
#   GUILD_ID: (opcional) ID de un guild para desarrollo (registra comandos sin 30 min de latencia)
#   ENVIRONMENT: development o production

# 3. Crear BD e inicializar schema Drizzle
npm run db:push

# 4. Inicia bot (TypeScript directo)
npm start
```

### Configuración de Slash Commands por entorno

**Desarrollo (ENVIRONMENT=development)**
- Si `GUILD_ID` está configurado: registra comandos en ese guild (instantáneo)
- Si `GUILD_ID` está vacío: registra global (30 min de latencia aprox.)

**Producción (ENVIRONMENT=production)**
- Siempre registra global

## Desarrollo

```bash
# Watch mode (auto-reload, TypeScript directo)
npm run dev

# Build (compilar a dist/, opcional)
npm run build

# PM2 (si usas sharding con múltiples procesos)
npm run pm2:start
npm run pm2:stop
npm run pm2:logs
```

## Comandos Disponibles

17 comandos implementados: `ping`, `help`, `ban`, `kick`, `warn`, `warnings`, `purge`, `info`, `user-info`, `unban`, `logs`, `automod`, `config`, `role-assign`, `bot-status`, `mute`, `unmute`.

Ver detalles en `src/commands/` o plantilla en `docs/COMMANDS.md`.

## Estructura

```
src/
├── core/        # Bootstrap, config, logger, DI
├── infra/       # Discord adapters, REST
├── database/    # Prisma, migrations, repos
├── domains/     # Reglas de negocio
├── systems/     # Orquestación, casos de uso
├── commands/    # Slash commands, context menus
├── events/      # Discord event handlers
├── services/    # Logger, audit, featureFlags, rateLimit
└── utils/       # Helpers puros
docs/
├── ARCHITECTURE.md  # Diseño y capas
├── COMMANDS.md      # Plantillas y guía de comandos
└── CHANGELOG.md     # Historial de cambios
```

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Comandos](./docs/COMMANDS.md)
- [Changelog](./docs/CHANGELOG.md)

## Soporte

For issues or contributions, open a GitHub issue.
