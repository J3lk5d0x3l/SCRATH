# enterprise-discord-bot

Bot enterprise modular y listo para producción — framework base para aplicaciones Discord.

<a href="https://discord.gg/7TCCJjwgd"><img src="https://discord.com/api/guilds/1233782230858465371/widget.png?style=banner2"></a>

## Badges

- ![Node](https://img.shields.io/badge/node-%3E%3D20.20.0-brightgreen)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue)
- ![discord.js](https://img.shields.io/badge/discord.js-14.25.1-7289DA)
- ![License](https://img.shields.io/badge/license-MIT-yellow)

---

## ✨ Características Principales

- **100% TypeScript (ESM)** — Tipado estricto, ejecución directa desde `src/` con `tsx`
- **Arquitectura Modular por Capas** — Separación clara: commands → systems → domains/database/services
- **Drizzle ORM + SQLite** — Base de datos ligera, rápida, con migraciones versionadas
- **Resiliencia Anti-Spam** — Rate limiting multinivel + backpressure + timeouts + degradación
- **Comandos Slash** — Ban, kick, mute, automod, warnings, logs de auditoría y más
- **Logger Estructurado (Pino)** — Trazabilidad completa en español
- **Auditoría Integrada** — Registro persistente de acciones sensibles
- **Feature Flags Runtime** — Habilita/deshabilita funcionalidades sin redeploy
- **Sharding Preparado** — Escalable a 10.000+ servidores con PM2

---

---

## 🚀 Quick Start (3 pasos)

**Requisitos previos**: Node.js ≥ 20.20.0 | Git

```bash
# 1️⃣  Clonar y instalar
git clone <REPO_URL>
cd enterprise-discord-bot
npm install

# 2️⃣  Configurar
cp .env.example .env
# Edita .env y reemplaza YOUR_DISCORD_BOT_TOKEN_HERE con tu token

# 3️⃣  Ejecutar
npm run build
npm start
```

✨ **El bot arrancará automáticamente, creando la BD si es necesaria.**

**Nota**: Si algo falla, asegúrate de:
- ✅ Tener Node.js 20+: `node --version`
- ✅ Token válido en `.env`
- ✅ Tener permisos de escritura en la carpeta

Para **desarrollo** con auto-reload:
```bash
npm run dev  # Reinicia automáticamente al editar src/
```

---

## Notas importantes y agradecimientos ❤️

Este proyecto se mantiene en desarrollo y se actualiza regularmente. Está pensado como una base sólida y modular para bots de Discord en entornos productivos. Si usas este repositorio en producción, revisa las configuraciones de seguridad, permisos y backups de la base de datos.

Únete al servidor de soporte usando el banner arriba para reportar bugs, hacer sugerencias o simplemente conectar con la comunidad.

Si quieres apoyar el desarrollo: con una estrella ⭐ 

---

## Guía de instalación detallada 📖

<details>
<summary>Requisitos de hosting</summary>

- Node.js >= 20.20.0
- Git
- Espacio en disco para la base de datos (por defecto SQLite en `data/`)
- Opcional: PM2 para procesos en producción (hay `pm2.config.js` incluido)

</details>

<details>
<summary>Requisitos del bot</summary>

- Un token de bot de Discord con permisos de `applications.commands` para registrar slash commands.
- Intents: Guilds, GuildMembers, GuildMessages, MessageContent, DirectMessages (configurados en el cliente).
- Si vas a registrar comandos sólo en desarrollo, puedes usar `GUILD_ID` en `.env` para registro rápido (instantáneo).

</details>

<details>
<summary>Configuración y arranque</summary>

1. **Clona el repo:**

```bash
git clone <REPO_URL>
cd enterprise-discord-bot
```

2. **Instala dependencias:**

```bash
npm install
```

3. **Crea un `.env` a partir de `.env.example` y rellena las variables necesarias:**

```bash
cp .env.example .env
# Edita .env y añade tu DISCORD_TOKEN y otras variables
```

**Variables principales:**

- `DISCORD_TOKEN` — Token del bot (requerido)
- `GUILD_ID` — ID del servidor para registrar comandos durante desarrollo (opcional)
- `NODE_ENV` — `production` o `development`
- `ENVIRONMENT` — Entorno de la app (ej. `development`, `staging`, `production`)
- `LOG_LEVEL` — Nivel de logs (`info`, `debug`, `warn`, `error`)
- `DATABASE_URL` — URL de la DB (por defecto `file:./data/bot.db`)
- `SHARD_COUNT`, `SHARD_LIST` — Opciones de sharding
- `FEATURE_FLAGS_CACHE_TTL` — Cache TTL en ms
- `RATE_LIMIT_GLOBAL_PER_MINUTE` — Límite global (defecto 120)
- `RATE_LIMIT_GUILD_PER_MINUTE` — Límite por guild (defecto 60)
- `RATE_LIMIT_USER_PER_MINUTE` — Límite por usuario (defecto 30)
- `RATE_LIMIT_COMMAND_COOLDOWN_SECONDS` — Cooldown entre comandos (defecto 3s)
- `AUDIT_ENABLED` — Habilitar auditoría (`true`/`false`)
- `AUDIT_RETENTION_DAYS` — Retención de logs (defecto 90 días)
- `PM2_NAMESPACE` — Namespace para PM2
- `BP_MAX_GLOBAL`, `BP_MAX_GUILD`, `BP_MAX_USER` — Límites de backpressure

4. **Comandos disponibles:**

```bash
npm run dev    # Modo desarrollo (tsx watch, auto-reload)
npm run build  # Compila TypeScript a dist
npm run start  # Ejecuta con tsx (desde src/)
npm run type-check  # Verifica tipos sin compilar
npm run lint   # Lint con ESLint
```

5. **Base de datos / Migraciones (Drizzle + SQLite):**

```bash
npm run db:generate  # Generar migraciones desde schema
npm run db:migrate   # Aplicar migraciones pendientes
npm run db:push      # Empujar esquema (sincronizar sin migraciones)
```

Si usas SQLite, la DB por defecto se crea en `data/bot.db` (ignorado en git).

6. **Producción (ejemplo con PM2):**

Si quieres ejecutar con PM2 para múltiples procesos/sharding:

```bash
npm run build
pm2 start pm2.config.js
pm2 logs      # Ver logs en tiempo real
pm2 stop all  # Detener todos los procesos
```

</details>

---

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/ban` | Banear usuario del servidor |
| `/kick` | Expulsar usuario del servidor |
| `/mute` | Silenciar usuario |
| `/unmute` | Retirar silencio a usuario |
| `/warn` | Advertir a usuario |
| `/warnings` | Ver advertencias de un usuario |
| `/automod` | Configurar moderación automática |
| `/logs` | Ver logs de auditoría |
| `/config` | Configurar parámetros del bot |
| `/info` | Información del servidor |
| `/user-info` | Información de usuario |
| `/ping` | Ver latencia del bot |
| `/help` | Obtener ayuda |
| `/role-assign` | Asignar roles |
| `/purge` | Limpiar mensajes |
| `/bot-status` | Cambiar estado del bot |

Ver [docs/COMMANDS.md](docs/COMMANDS.md) para más detalles y guía para crear nuevos comandos.

---

## 📁 Estructura del proyecto

```
enterprise-discord-bot/
├── src/
│   ├── core/              # Bootstrap, config, logger, inyección de dependencias
│   │   ├── bootstrap.ts
│   │   ├── config.ts      # Lectura de .env
│   │   └── container.ts   # Contenedor DI (services)
│   ├── infra/             # Adaptadores Discord, client, registries
│   │   ├── client.ts      # Cliente de Discord
│   │   ├── commandRegistry.ts
│   │   └── eventRegistry.ts
│   ├── database/          # Drizzle (ORM), repositorios, migraciones
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── repositories.ts
│   ├── commands/          # Slash commands
│   ├── events/            # Event handlers de Discord
│   ├── services/          # Logger, auditoría, rate limiting, feature flags
│   ├── domains/           # Lógica de negocio por dominio
│   ├── systems/           # Orquestación de casos de uso
│   ├── utils/             # Helpers y utilidades
│   └── index.ts           # Entrypoint
├── data/                  # SQLite database (generada, ignorada en git)
├── drizzle/               # Migraciones de Drizzle
├── docs/
│   ├── ARCHITECTURE.md    # Diseño arquitectónico detallado
│   ├── COMMANDS.md        # Guía de comandos
│   └── CHANGELOG.md       # Historial de cambios
├── .env.example           # Variables de entorno (plantilla)
├── .gitignore
├── LICENSE                # MIT License
├── package.json
├── tsconfig.json
├── pm2.config.js          # Configuración para PM2 (sharding)
└── README.md              # Este archivo
```

---

## ⚙️ Configuración

### Imports (ESM + TypeScript)

El proyecto usa **ESM (ECMAScript Modules)** con TypeScript. Todos los imports internos deben incluir `.js`:

```typescript
// ✅ CORRECTO
import { getService } from '../core/container.js';
import logger from '../services/logger.js';

// ❌ INCORRECTO (en ESM)
import { getService } from '../core/container';
```

Esto es necesario porque TypeScript compila a ESM y Node.js requiere que los imports se resuelvan correctamente en runtime. Ver [IMPORT_AUDIT_REPORT.md](IMPORT_AUDIT_REPORT.md) para más detalles.

### Configuración de Comandos

Los comandos se descubren automáticamente en `src/infra/commandRegistry.ts` explorando `src/commands/*.ts`. Cada comando debe exportar un objeto con estructura estándar.

### Configuración de Eventos

Los eventos se registran automáticamente en `src/infra/eventRegistry.ts`. Cada evento en `src/events/*.ts` debe exportar un objeto con `name`, `once`, y `execute`.

### Configuración Central

La configuración principal está en `src/core/config.ts` y lee variables de entorno desde `.env`. Los servicios se inyectan a través del contenedor DI en `src/core/container.ts`.

---

## 🏛️ Flujo de ejecución

1. **Inicio** — `src/index.ts` importa `dotenv` y llama a `bootstrap()`
2. **Bootstrap** — `src/core/bootstrap.ts`:
   - Valida configuración (DISCORD_TOKEN obligatorio)
   - Inicializa contenedor DI (logger, DB, repositorios, servicios)
   - Crea cliente de Discord
   - Carga comandos desde `src/commands/`
   - Carga eventos desde `src/events/`
   - Establece handler del evento `ready`
3. **Login** — `client.login(DISCORD_TOKEN)` se conecta a Discord
4. **Ready** — Al conectar, se registran los comandos slash con `registerSlashCommands`
5. **Handlers** — Eventos como `interactionCreate` (comandos) y `messageCreate` (mensajes) se procesan
6. **Shutdown** — Señales `SIGINT`/`SIGTERM` desencadenan `gracefulShutdown` (cierra DB, cliente, contenedor)

---

## 🔐 Seguridad

- ✅ Validaciones explícitas en entradas
- ✅ Auditoría integrada de acciones administrativas
- ✅ Rate limiting multinivel (global, por guild, por usuario)
- ✅ Backpressure para degradación ordenada
- ✅ Permisos de Discord respetados
- ✅ Sin ejecución de código dinámico
- ✅ Secrets protegidos en `.env` (ignorado en git)

---

## 📚 Documentación Adicional

- [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) — Diseño detallado, capas, decisiones técnicas
- [**COMMANDS.md**](docs/COMMANDS.md) — Guía para crear nuevos comandos
- [**CHANGELOG.md**](docs/CHANGELOG.md) — Historial de cambios y versiones
- [**IMPORT_AUDIT_REPORT.md**](IMPORT_AUDIT_REPORT.md) — Reporte de auditoría de imports (ESM compliance)

---

## 📦 Stack Tecnológico

| Librería | Versión | Propósito |
|----------|---------|-----------|
| discord.js | ^14.25.1 | Cliente Discord |
| drizzle-orm | ^0.30.0 | ORM tipo-safe |
| better-sqlite3 | ^8.5.0 | SQLite driver |
| pino | ^9.6.0 | Logger estructurado |
| dotenv | ^16.4.7 | Gestión de .env |
| tsx | ^4.7.0 | TypeScript executor (dev) |
| TypeScript | ^5.5.2 | Lenguaje compilado |

---

## 🚀 Despliegue

### Desarrollo Local

```bash
npm run dev
```

### Producción (Node.js directo)

```bash
npm start
```

### Producción (PM2)

```bash
npm run build
pm2 start pm2.config.js --name enterprise-discord-bot
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/tu-feature`)
3. Commit tus cambios (`git commit -m "feat: descripción"`)
4. Push a la rama (`git push origin feature/tu-feature`)
5. Abre un Pull Request

**Reglas:**
- Respeta la estructura modular
- Mantén tipos TypeScript estrictos
- Incluye imports con `.js` en ESM
- Testa cambios antes de enviar PR
- Ejecuta `npm run lint` y `npm run type-check`

---

## 📄 Licencia

MIT License — Ver [LICENSE](LICENSE) para más detalles.

```
Copyright (c) 2026 Samuel Vélez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👤 Créditos

Código por **Samuel Vélez**

**Discord**: [Servidor de Soporte](https://discord.gg/7TCCJjwgd)

---

## 📞 Soporte & Contacto

¿Preguntas, bugs o sugerencias?

- 📖 Revisa la [documentación](docs/)
- 🐛 Abre un [Issue](https://github.com/J3lk5d0x3l/SCRATH/issues)
- 💬 Únete al [servidor de Discord](https://discord.gg/7TCCJjwgd)
- 📧 Contacta directamente si es necesario

---

**Hecho con ❤️ para la comunidad**
