# enterprise-discord-bot

Bot Discord modular para entornos producción. Framework base con arquitectura en capas, TypeScript, Drizzle + SQLite.

**Node 20+** | **TypeScript 5.5** | **discord.js 14.25**

---

## Únete a la comunidad

¿Tienes preguntas? ¿Reportes de bugs? ¿Sugerencias?

**[→ Entra al servidor de Discord](https://discord.gg/7TCCJjwgd)**

---

## Setup

```bash
git clone <REPO_URL>
cd enterprise-discord-bot
npm install

cp .env.example .env
# Edita .env y agrega DISCORD_TOKEN

npm run dev
```

El bot se conectará automáticamente y creará la base de datos si es necesario.

Si falla algo, verifica:
- Node version: `node --version`
- Token válido en `.env`
- Permisos de escritura

### Archivos generados localmente

`package-lock.json` y `pm2.config.js` se generan localmente en cada instalación:
- `package-lock.json`: Se crea automáticamente con `npm install`
- `pm2.config.js`: Generado al iniciar el bot en producción

No están en git para evitar conflictos entre entornos. Cada desarrollador/servidor tiene los suyos.

## Variables de entorno

```env
DISCORD_TOKEN=tu_token_aqui
NODE_ENV=development
ENVIRONMENT=development
LOG_LEVEL=info
DATABASE_URL=file:./data/bot.db
GUILD_ID=123456789  # Opcional, para registro rápido en dev
```

## Comandos

| Comando | Qué hace |
|---------|----------|
| `/ban` | Banea un usuario |
| `/kick` | Expulsa un usuario |
| `/mute` | Silencia a un usuario |
| `/unmute` | Quita el silencio |
| `/warn` | Advierte a un usuario |
| `/warnings` | Ve advertencias |
| `/automod` | Configura moderación automática |
| `/logs` | Ve logs de auditoría |
| `/config` | Configura el bot |
| `/info` | Info del servidor |
| `/user-info` | Info de un usuario |
| `/ping` | Latencia del bot |
| `/role-assign` | Asigna roles |
| `/purge` | Limpia mensajes |
| `/bot-status` | Cambia el estado |

Ver [docs/COMMANDS.md](docs/COMMANDS.md) para crear nuevos comandos.

## Estructura

```
src/
├── commands/      Slash commands
├── events/        Event handlers de Discord
├── domains/       Lógica de negocio
├── services/      Logger, auditoría, rate limiting, etc
├── database/      Drizzle ORM + repositorios
├── core/          Config, DI container, bootstrap
├── infra/         Cliente de Discord, registries
├── systems/       Orquestación de casos de uso
├── utils/         Helpers y utilidades
└── index.ts       Entrypoint
```

La arquitectura está en capas. Cada capa tiene responsabilidades claras. Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Desarrollo

```bash
npm run dev              # Watch mode (auto-reload)
npm run type-check      # Verifica tipos
npm run lint            # ESLint
npm run build           # Compila TypeScript

# Base de datos
npm run db:generate     # Genera migraciones
npm run db:migrate      # Aplica migraciones
npm run db:push         # Sincroniza schema


## Producción

```bash
npm start

# O con PM2 para sharding
npm run build
pm2 start pm2.config.js
```

## Seguridad

- Validaciones en entradas
- Auditoría integrada
- Rate limiting
- Permisos de Discord respetados
- Sin código dinámico
- Secrets en `.env`

## Stack

- discord.js 14.25
- Drizzle ORM
- better-sqlite3
- Pino (logger)
- TypeScript 5.5
- tsx

## Documentación

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Capas, dependencias, decisiones
- [COMMANDS.md](docs/COMMANDS.md) — Crear comandos
- [CHANGELOG.md](docs/CHANGELOG.md) — Historial

## Licencia

MIT
