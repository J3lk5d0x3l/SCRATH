# Changelog

## v2.0.0 (actual) - 2026-02-08

**MIGRACIÓN COMPLETADA: JavaScript → TypeScript (ESM) + Drizzle ORM + Resiliencia Anti-Spam**

### Cambios Mayores (v2.0.0)

#### Tecnología Base
- ✅ **100% TypeScript** - Migración completa de src/ a .ts (48 archivos)
- ✅ **Prisma → Drizzle ORM** - 10 tablas con índices + better-sqlite3
- ✅ **ESM Nativo** - NodeNext module resolution, sin require()
- ✅ **Strict Mode** - tsconfig.json con strict: true, noImplicitAny, isolatedModules

#### Resiliencia Anti-Spam REAL
- ✅ **Rate Limiter** - Token bucket 3-niveles (global 120/min, guild 60/min, user 30/min, command cooldown)
- ✅ **Backpressure** - Semáforo 3-tiers (max 50 global, 10 guild, 3 user concurrentes)
- ✅ **Timeouts** - withTimeout() con exponential backoff retry (30s default, max 2 intentos)
- ✅ **Error Boundaries** - uncaughtException + unhandledRejection handlers + try-catch en interactionCreate
- ✅ **Auditoría Fail-Safe** - createAudit() nunca crashea, .catch(() => null) en repos

#### Base de Datos (Drizzle)
- users (discordId unique)
- guilds (discordId unique)
- guildSettings (configuración por servidor)
- guildMembers (relación usuario-servidor)
- warnings (advertencias persistentes)
- bans (bans con TTL opcional)
- auditLogs (bitácora completa)
- featureFlags (flags globales)
- featureFlagOverrides (overrides por servidor)
- state (cache key-value con TTL)

#### Logger Centralizado
- Pino estructurado (JSON production, pretty+colored dev)
- 100% Español (contexto + mensajes)
- NO console.log en codebase

#### Comandos (17 total)
ping, help, ban, kick, warn, warnings, purge, info, user-info, unban, logs, automod, config, role-assign, bot-status, mute, unmute

#### Scripts Actualizado
- `npm run dev` → `tsx watch src/index.ts`
- `npm start` → `tsx src/index.ts`
- `npm run build` → `tsc -p tsconfig.json` (opcional, no requerido para ejecución)
- `npm run db:push` → `drizzle-kit push:sqlite`

### Migraciones Internas Completadas
- Eliminados: Prisma schema, migraciones Prisma
- Agregados: drizzle.config.ts, schema.ts Drizzle, mejor-sqlite3 driver
- Actualizado: package.json (NO Prisma, agregado Drizzle, Pino, tsx)
- Actualizado: tsconfig.json (strict mode, ESM NodeNext)

---

## v1.0.0 - 2026-02-06

Enterprise Discord Bot - arquitectura modular.

### Implementado
- Arquitectura por capas (core, infra, domains, systems, commands, events, services)
- DI container para inyección de dependencias
- Logger centralizado con pino (NODE_ENV aware)
- Prisma + SQLite para persistencia
- Servicios: Logger, Audit, FeatureFlags, RateLimit, EmbedFactory
- Sistemas de negocio (UserSystem, GuildSystem, ConfigSystem, ModerationSystem, etc.)
- Dominios: ConfigDomain, ModerationDomain, BanDomain, AutoModDomain
- Comandos y event handlers para Discord
- Auditoría fail-safe ante fallos de BD

### Cambios de hardening (resumen)
- Logger: centralizado en services, serialización de errores con `{ err }`, NODE_ENV aware
- Audit: fail-safe ante fallos de BD, upsert de referencias para evitar FK violations
- Prisma: inicialización robusta con creación recursiva de carpeta SQLite
- Feature Flags: caché en memoria con fallback seguro
- Rate Limit: implementación en memoria

### Próximos pasos (opcional)
- Expandir cobertura de pruebas
- Webhooks y scheduled tasks
- Métricas de Prometheus

#### Domains
- [x] `src/domains/BanDomain.js` - Validación: duración, razón, usuario válido

#### Systems
- [x] `src/systems/StatisticsSystem.js` - getBotStats, getGuildStats, getUserStats, getModerationStats

#### Commands (5 comandos nuevos)
- [x] `src/commands/warnings.js` - `/warnings [usuario]` (listar advertencias)
- [x] `src/commands/ban.js` - `/ban usuario razón [días-de-mensajes]`
- [x] `src/commands/unban.js` - `/unban usuario-id razón`
- [x] `src/commands/user-info.js` - `/user-info [usuario]` (info detallada)
- [x] `src/commands/bot-status.js` - `/bot-status` (estadísticas del bot)

#### Utilities
- [x] `src/utils/discord-helpers.js` - getMutedRole, applyMute, removeMute, banUser, unbanUser, isUserBanned, fetchMember
- Reutiliza formatters, embedFactory, validators

#### Infrastructure
- [x] `src/core/container.js` - Registra StatisticsSystem

### 📊 Estadísticas Fase 4
- **Comandos**: 5 nuevos (warnings, ban, unban, user-info, bot-status) = **13 total**
- **Systems**: 1 nuevo (StatisticsSystem) = **5 total**
- **Domains**: 1 nuevo (BanDomain) = **3 total**
- **Utilities**: 1 nuevo (discord-helpers) = **4 total**
- **Archivos creados/modificados**: 10
- **Líneas de código**: ~2000+ (comentado y estructurado)

---

## Fase 3: Moderación + Configuración

### ✅ Completado

#### Database Extensions
- [x] `prisma/schema.prisma` - Agregar modelo Warning (guildId, userId, reason, expiresAt, active)
- [x] `src/database/repositories.js` - Agregar WarningRepository (create, findByUserId, countActive, cleanup)

#### Domains (Reglas de Negocio)
- [x] `src/domains/ConfigDomain.js` - Validación: prefix, language, loggingEnabled
- [x] `src/domains/ModerationDomain.js` - Validación: mute duration, warn reason; auto-actions (kick/ban por warns)

#### Systems (Orquestación)
- [x] `src/systems/ConfigSystem.js` - getConfig, updateConfig, resetConfig
- [x] `src/systems/ModerationSystem.js` - warnUser, getUserWarnings, removeWarning, muteUser, unmuteUser, cleanupExpiredWarnings

#### Commands (5 comandos nuevos)
- [x] `src/commands/config.js` - `/config get|set` (prefix, language, logging)
- [x] `src/commands/mute.js` - `/mute usuario duración razón`
- [x] `src/commands/unmute.js` - `/unmute usuario`
- [x] `src/commands/warn.js` - `/warn usuario razón` (con auto-actions)
- [x] `src/commands/logs.js` - `/logs [acción]` (auditoría filtrable)

#### Infrastructure
- [x] `src/core/container.js` - Registra ConfigSystem y ModerationSystem

#### Utilities
- Reutiliza embedFactory (createWarningEmbed)
- Reutiliza formatters (formatTimestamp, formatDuration, truncate)
- Nuevas funciones helper: parseDuration (en mute.js)

### 📊 Estadísticas Fase 3
- **Comandos**: 5 nuevos (config, mute, unmute, warn, logs)
- **Systems**: 2 nuevos (ConfigSystem, ModerationSystem)
- **Domains**: 2 nuevos (ConfigDomain, ModerationDomain)
- **Archivos creados**: 10
- **Líneas de código**: ~1500+ (comentado y estructurado)

---

## Fase 2: Commands + Systems Implementation

### ✅ Completado

#### Core Infrastructure & Entry Point
- [x] `src/index.js` - Bootstrap principal (validación, DI, login, event loop)
- [x] `src/infra/client.js` - Discord client con intents y presencia
- [x] `src/infra/commandRegistry.js` - Loader dinámico de comandos (auto-discovery)
- [x] `src/infra/eventRegistry.js` - Loader dinámico de event handlers

#### Commands (3 comandos utilidad)
- [x] `src/commands/help.js` - `/help` - Lista comandos con categorías
- [x] `src/commands/ping.js` - `/ping` - Latencia API + round trip
- [x] `src/commands/info.js` - `/info` - Info servidor/usuario con formatting

#### Systems (Orquestación)
- [x] `src/systems/UserSystem.js` - getOrCreateUser, getUserStats, getUser
- [x] `src/systems/GuildSystem.js` - getOrCreateGuild, getGuildInfo, settings

#### Event Handlers
- [x] `src/events/ready.js` - Bot conectado (log info + shard)
- [x] `src/events/guildCreate.js` - Bot añadido a servidor (welcome message)
- [x] `src/events/interactionCreate.js` - Enrutador de slash commands (rate limit, audit, errores)

#### Services & Utilities
- [x] `src/services/embedFactory.js` - Factory de embeds (success, error, info, warning, list)
- [x] `src/utils/formatters.js` - Formateo de texto (timestamp, duración, números)
- [x] `src/utils/validators.js` - Validadores puros (IDs, permisos, ranges)

#### Dependencies & Docs
- [x] Añadido `dotenv` a package.json
- [x] Actualizado `src/core/container.js` - Registra sistemas (UserSystem, GuildSystem)
- [x] Actualizado CHANGELOG.md

### 📊 Estadísticas Fase 2
- **Comandos**: 3 (utilidad)
- **Systems**: 2 (User, Guild)
- **Event Handlers**: 3 (ready, guildCreate, interactionCreate)
- **Archivos creados**: 13
- **Líneas de código**: ~1000+ (comentado y estructurado)

## Fase 1: Enterprise Core Hardening + Database Foundation

### ✅ Completado

#### Core Infrastructure
- [x] Estructura de carpetas (capas estrictas)
- [x] `src/core/config.js` - Configuración centralizada y validación
- [x] `src/core/logger.js` - Logger Pino estructurado
- [x] `src/core/container.js` - DI container singleton
- [x] `.env.example` - Template de variables de entorno
- [x] `package.json` - Stack Node.js 20+, discord.js 14.25.1, ESM

#### Database & ORM
- [x] `prisma/schema.prisma` - Schema completo:
  - User, Guild, GuildSettings
  - AuditLog (con índices)
  - FeatureFlag (global + per-guild)
  - State (caché transversal)
- [x] `src/database/client.js` - Inicialización Prisma
- [x] `src/database/repositories.js` - Repositorios:
  - UserRepository
  - GuildRepository
  - GuildSettingsRepository
  - AuditRepository
  - FeatureFlagRepository

#### Services Layer
- [x] `src/services/audit.js` - Servicio de auditoría con log mínimo
- [x] `src/services/featureFlags.js` - Feature flags runtime + cache
- [x] `src/services/rateLimit.js` - Rate limiting multinivel (global, guild, user, command)

#### Documentation
- [x] `docs/ARCHITECTURE.md` - Arquitectura completa, capas, dependencias
- [x] `docs/README.md` - Quick start
- [x] `docs/COMMANDS.md` - Plantilla y guía de comandos
- [x] `docs/CHANGELOG.md` - Este archivo

### 🔄 Próximas (Fase 2)

- [ ] `src/commands/help.js` - Comando /help con autodescubrimiento
- [ ] `src/commands/health.js` - Health check
- [ ] Primeros 10 comandos en 3+ dominios
- [ ] `src/domains/` - Entidades y reglas por dominio
- [ ] `src/systems/` - Casos de uso
- [ ] `src/events/` - Event handlers base
- [ ] `src/index.js` - Entry point y bootstrap
- [ ] `pm2.config.js` - Configuración sharding

---

## Notas de Versión

### v1.0.0-alpha (Fase 1)

**Hallazgos clave:**
1. Repositorio vacío → implementación desde cero
2. Arquitectura limpia desde inicio (sin deuda técnica)
3. Matriz de dependencias estricta (no caos)
4. Logging centralizado (sin console.log disperso)
5. Auditoría integrada desde inicio (compliance)
6. Feature flags para rollout controlado
7. Rate limiting multinivel (evita abuso)

**Diferenciales vs bots básicos:**
- Separación clara comando → system → domain → repository
- Inyección de dependencias (DI container)
- Auditoría + compliance desde día 1
- Preparado para +10k guilds con sharding
- Logger estructurado (observabilidad)

---

**Estado actual**: Fase 5 ✅ (Sharding + Advanced Admin + Observability) - 18 comandos, 7 sistemas, 4 dominios

Próximas: Fase 6 (Dashboard web, Webhooks, Scheduled tasks, Prometheus metrics)
