# Arquitectura Enterprise Discord Bot

## Visión General

Esta es una plataforma modular enterprise-ready para Discord bots, diseñada para:
- **Escalabilidad**: +10.000 guilds con sharding PM2
- **Mantenibilidad**: Separación de capas, DI, matriz de dependencias estricta
- **Observabilidad**: Logger estructurado (pino), auditoría, diagnostics
- **Seguridad**: Validaciones, permisos explícitos, sin código dinámico
- **Localizacion**: Preparado para i18n (ahora en español)

---

## Capas y Fronteras

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTACIÓN (Discord)                      │
├──────────────────────────┬──────────────────────────────────────┤
│ src/commands/            │ src/events/                          │
│ (Slash + Context Menus)  │ (Discord event handlers)             │
├──────────────────────────┴──────────────────────────────────────┤
│                    ORQUESTACIÓN (Systems)                        │
│ src/systems/ - Casos de uso, sin lógica de negocio directa      │
├──────────────────────────┬──────────────────────────────────────┤
│ Dominio              │ Base de Datos   │ Servicios              │
│ src/domains/         │ src/database/   │ src/services/          │
│ (Reglas negocio)     │ (Persistencia)  │ (Logger, Audit, etc)   │
├──────────────────────────┴──────────────────────────────────────┤
│                    INFRAESTRUCTURA (Core)                        │
│ src/core/ - Config, Logger, DI Container                        │
│ src/infra/ - Discord Adapters, REST, Sharding                   │
└─────────────────────────────────────────────────────────────────┘
```

### Descripciones de Capas

#### `src/core/`
- **Responsabilidad**: Bootstrap, ciclo de vida, inyección de dependencias, configuración global
- **Archivos**:
  - `config.js` - Variables de entorno + validación
  - `container.js` - DI container singleton (registra servicios y repositorios)
  - Nota: El `logger` se ubica en `src/services/logger.js`; `core` orquesta wiring y consume `services/database` vía el contenedor.
- **Prohibido**: lógica de negocio, imports de commands/events

#### `src/infra/`
- **Responsabilidad**: Adaptadores Discord (client, gateway, shard manager), REST registry
- **Archivos**:
  - `client.js` - Inicialización Discord client con intents + partials
  - `eventRegistry.js` - Carga y registra event handlers dinámicamente
  - `commandRegistry.js` - Carga y registra slash commands
- **Configuración Critical**:
  - Intents: Guilds, GuildMembers, GuildMessages, MessageContent, DirectMessages
  - Partials: [Channel] (requerido para cachear DMs correctamente)
  - Presence: ActivityType.Playing (enum oficial, no magic numbers)
- **Futuro**: Sharding con PM2, health checks, event loop
- **Prohibido**: Lógica de negocio, domains, database logic directo

#### `src/database/`
- **Responsabilidad**: Prisma client, migrations, repositorios (acceso a datos puro)
- **Archivos**:
  - `client.js` - Inicialización Prisma
  - `repositories.js` - Acceso a datos (UserRepo, GuildRepo, AuditRepo, etc)
- **Prohibido**: discord.js, lógica de negocio

#### `src/domains/`
- **Responsabilidad**: Reglas de negocio puro, value objects, entidades
- **Futuro**: UserDomain, GuildDomain, ModerationDomain, etc
- **Prohibido**: discord.js, prisma, repositories (inyecta datos)

#### `src/systems/`
- **Responsabilidad**: Casos de uso, orquestación (llama domains + repos)
- **Ejemplo**: GetUserStatsSystem, BanUserSystem, UpdateSettingsSystem
- **Prohibido**: discord.js directo (usa adapters), lógica mixta

#### `src/commands/`
- **Responsabilidad**: Definición de slash commands + context menus, presentación
- **Flujo**: Recibe interaction → valida → llama systems → responde
- **Prohibido**: Lógica de negocio, database directo, discord.js event listeners

#### `src/events/`
- **Responsabilidad**: Event handlers Discord → systems/services
- **Ejemplo**: ready, guildCreate, interactionCreate, etc
- **Prohibido**: Lógica de negocio, database directo

#### `src/services/`
- **Responsabilidad**: Servicios transversales (logger, audit, featureFlags, rateLimit, embedFactory)
- **Nota**: El `logger` vive en `src/services/logger.js` y es consumido por `core`/`container` y por el resto de servicios.
- **Acceso**: commands/, events/, systems/ pueden importar

#### `src/utils/`
- **Responsabilidad**: Helpers puros (sin estado, sin IO)
- **Ejemplo**: formatters, validators, calculations

---

## Matriz de Dependencias (orientativa)

La siguiente matriz muestra dependencias permitidas:

```
commands/    -> systems/, services/, utils/
events/      -> systems/, services/, utils/
systems/     -> domains/, services/, database/
domains/     -> utils/
database/    -> (prisma client) utilizado por repositorios
services/    -> utils/, database/repositories (cuando procede)
infra/       -> core/, services/, utils/
core/        -> dependencies (instancia services, database, config)
```

Notas importantes:
- El `container` en `src/core/container.js` instancia servicios, database y repositorios. No es completamente independiente; su rol es centralizar wiring y lifecycle.
- `commands`/`events` obtienen servicios vía `getService()` del contenedor.
- `core` puede importar de `services` y `database` para instanciarlos.

**Regla de Oro**: `commands`/`events` no deben contener lógica de negocio; deben llamar a `systems` o `services`.

---

## Flujo de Ejecución (Interacción típica)

```
1. Discord Event (interactionCreate)
     ↓
2. Event Handler (src/events/interactions.js)
     ↓
3. Sistema (src/systems/UserSystem.js)
     ↓
4a. Domain (validación, reglas negocio)
4b. Repository (obtiene datos)
     ↓
5. Respuesta al usuario (embed en español)
     ↓
6. Auditoría (si aplica)
```

---

## Configuración y Ciclo de Vida

### Startup

```javascript
1. load .env → config.js
2. validate config → error si falta DISCORD_TOKEN
3. initialize logger
4. initialize DI container (prisma, repos, services)
5. load commands / register slash commands
6. load event handlers
7. connect to Discord (client.login)
8. emit ready event
```

### Shutdown

```javascript
1. client.destroy()
2. close prisma connection
3. cleanup timers
```

---

## Políticas y Restricciones

### Logging
- **Logger único**: `pino` centralizado desde `src/services/logger.js`
- **NO**: `console.log`, `console.error`, etc
- **Formato**: `{ timestamp, level, shardId, guildId, correlationId, message }`
- **Máximo**: 1 log de arranque por shard + errores relevantes

### Seguridad
- **Validación**: Todas las entradas (permisos, tipos, ranges)
- **Secrets**: NO hardcodear tokens, IDs sensibles (usa .env)
- **Respuestas**: Maneja correctly `deferred`, `replied` (evita conflicts)
- **Auditoría**: Log acciones sensibles (bans, config changes, etc)

### Errores
- **Error Boundaries**: Try-catch en handlers, systems
- **Graceful Degradation**: Fallos seguros (ej: feature flag disabled si BD cae)
- **User Feedback**: Siempre responde al usuario (embed con error en español)

### Code Quality
- **ESM puro**: No CommonJS
- **Async/await**: No promises crudo
- **Módulos**: Pequeños, reutilizables, testables
- **Nombres**: Descriptivos en español (dominios) e inglés (técnico)

---

## Tabla de Tecnologías

| Componente | Versión | Propósito |
|-----------|---------|----------|
| Node.js | 20.20+ | Runtime |
| discord.js | 14.25.1 | Discord API |
| Prisma | ^6.5.0 | ORM, migrations |
| SQLite | (via Prisma) | Persistencia local |
| pino | ^9.6.0 | Logger estructurado |
| PM2 | (futuro) | Sharding, process manager |

---

## Extensiones Futuras (Fase 6+)

- **Scheduled Tasks**: Cron jobs para cleanup de warnings/bans expirados
- **Webhooks**: Integración con sistemas externos (logs, analytics)
- **Web Dashboard**: Admin panel con React/Vue (REST API)
- **Caché**: Redis para feature flags globales
- **Metrics**: Prometheus + Grafana integration
- **i18n**: Sistema de strings traducibles (multi-idioma)
- **Plugins**: Sistema de cargar comandos/sistemas dinámicamente

---

## Estado actual (repositorio)

- **Comandos implementados**: 17 (archivos en `src/commands`, excluyendo .gitkeep). Lista actual: `help`, `ping`, `info`, `bot-status`, `user-info`, `config`, `mute`, `unmute`, `warn`, `warnings`, `ban`, `unban`, `kick`, `automod`, `purge`, `role-assign`, `logs`.
- **Systems**: 8 implementados en `src/systems` (UserSystem, GuildSystem, ConfigSystem, ModerationSystem, StatisticsSystem, AutoModSystem, ShardingSystem, MentionHandlerSystem).
- **Domains**: varios dominios de negocio presentes en `src/domains` (ej.: `AutoModDomain`, `ModerationDomain`, `ConfigDomain`, `BanDomain`, etc. — revisar carpeta para detalle).
- **Modelos BD (Prisma)**: `User`, `Guild`, `GuildSettings`, `GuildMember`, `AuditLog`, `FeatureFlag`, `Warning`, `Ban`, `State` (ver `prisma/schema.prisma`).
- **Servicios**: Logger (`src/services/logger.js`), Audit, FeatureFlags, RateLimit, EmbedFactory, entre otros.

Nota: se eliminaron referencias a fases o features no presentes en el código actual (por ejemplo claims de "Fase 5 completa", endpoints HTTP de health, o conteos inexactos). Este documento refleja el estado del código en el repositorio.
---

## Contribución y Mantenimiento

- **Review de PRs**: Valida matriz de dependencias
- **Nuevos comandos**: Plantilla en docs/COMMANDS.md
- **Nuevos servicios**: Registra en container.js
- **Migraciones BD**: Usa `prisma migrate dev`

---

**Última actualización**: Fase 0.3 (Hardening Lote 3 - Enums Oficiales, Partials DM, AllowedMentions)
