# README - Enterprise Discord Bot

Bot Discord modular, escalable, enterprise-ready.

## Características

Resumen de la arquitectura y componentes implementados:

- Arquitectura modular por capas (core, infra, domains, systems, commands, events, services)
- Logger estructurado (`src/services/logger.js`)
- Base de datos Prisma + SQLite (schema en `prisma/schema.prisma`)
- Auditoría integrada (`src/services/audit.js`)
- Feature flags runtime (`src/services/featureFlags.js`)
- Rate limiting en memoria (`src/services/rateLimit.js`)
- ESM puro
- Preparado para sharding (sistema en `src/systems/ShardingSystem.js`)
- Comandos y sistemas (ver `src/commands/`, `src/systems/`, `src/domains/`)
- Event handlers para eventos Discord principales
- Embed factory para respuestas de usuario

## Stack Requerido

- Node.js 20.20+
- discord.js 14.25.1
- Prisma 6.5.0
- SQLite 3

## Instalación Rápida (mínimo)

```bash
# 1. Instala dependencias
npm install

# 2. Copia .env.example a .env y completa las variables obligatorias
copy .env.example .env
# Asegúrate de definir:
#   DISCORD_TOKEN: token de tu bot en Discord Developer Portal
#   DATABASE_URL: ruta SQLite (por defecto: file:./prisma/bot.db)
#   GUILD_ID: (opcional) ID de un guild para desarrollo (registra comandos sin 30 min de latencia)
#   ENVIRONMENT: development o production (afecta registro de comandos)

# 3. Generar Prisma client
npm run db:generate

# 4. (Desarrollo) ejecutar migraciones locales
npm run db:migrate:dev

# 5. Inicia bot
npm start
```

### Configuración de Slash Commands por entorno

**Desarrollo (ENVIRONMENT=development)**
- Si `GUILD_ID` está configurado: registra comandos en ese guild (instantáneo, sin 30 min de latencia)
- Si `GUILD_ID` está vacío: registra global (30 min de latencia aprox.)

**Producción (ENVIRONMENT=production)**
- Siempre registra global

Ver `.env.example` para más detalles.

## Desarrollo

```bash
# Watch mode (auto-reload)
npm run dev

# PM2 (si usas sharding con múltiples procesos)
npm run pm2:start
npm run pm2:stop
npm run pm2:logs
```

## Comandos Disponibles

Ver lista completa de comandos en `src/commands/` o en `docs/COMMANDS.md`.

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
