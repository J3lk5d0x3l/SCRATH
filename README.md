# 🤖 Enterprise Discord Bot

Un bot Discord **modular, escalable y enterprise-ready** con arquitectura profesional por capas, diseñado para soportar miles de servidores con alto rendimiento y mantenibilidad.

## ✨ Características Principales

- **Arquitectura Modular por Capas** - Separación clara entre presentación, lógica de negocio, datos e infraestructura
- **Comandos Slash Completos** - Ban, kick, mute, automod, warnings, logs de auditoría y más
- **Base de Datos Prisma + SQLite** - Persistencia robusta y migraciones versionadas
- **Logger Estructurado** - Trazabilidad completa con Pino
- **Auditoría Integrada** - Registro de todas las acciones administrativas
- **Feature Flags Runtime** - Habilita/deshabilita funcionalidades sin redeploy
- **Rate Limiting** - Protección contra abuso
- **Sharding Preparado** - Escalable a 10.000+ servidores con PM2
- **ESM Puro** - Módulos modernos de JavaScript
- **Totalmente Documentado** - Guías de arquitectura, comandos y changelog

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js** ≥ 20.20.0
- **npm** o **yarn**
- Token de un bot en [Discord Developer Portal](https://discord.com/developers/applications)

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/SCRAT.git
cd SCRAT

# 2. Instala dependencias
npm install

# 3. Crea tu archivo .env
cp .env.example .env

# 4. Configura las variables de entorno obligatorias en .env:
#    - DISCORD_TOKEN: Token de tu bot
#    - DATABASE_URL: Ruta a la base de datos (ej: file:./prisma/bot.db)
#    - ENVIRONMENT: development o production

# 5. Genera el cliente de Prisma
npm run db:generate

# 6. Ejecuta las migraciones
npm run db:migrate:dev

# 7. Inicia el bot
npm start
```

## 📋 Comandos Disponibles

El bot incluye los siguientes comandos slash:

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

Ver [`docs/COMMANDS.md`](docs/COMMANDS.md) para más detalles.

## 📁 Estructura del Proyecto

```
SCRAT/
├── src/
│   ├── core/              # Bootstrap, config, logger, inyección de dependencias
│   ├── infra/             # Adaptadores Discord, REST, client
│   ├── database/          # Prisma, repositorios, migraciones
│   ├── domains/           # Lógica de negocio (AutoMod, Ban, Config, etc)
│   ├── systems/           # Orquestación de casos de uso
│   ├── commands/          # Slash commands
│   ├── events/            # Event handlers de Discord
│   ├── services/          # Logger, auditoría, rate limiting, health checks
│   └── utils/             # Helpers y utilitarios puros
├── prisma/                # Schema, migraciones
├── docs/                  # Documentación
│   ├── ARCHITECTURE.md    # Diseño arquitectónico detallado
│   ├── COMMANDS.md        # Plantillas y guía de comandos
│   └── CHANGELOG.md       # Historial de cambios
├── .env.example           # Variables de entorno (plantilla)
├── package.json
└── pm2.config.js          # Configuración para PM2 (sharding)
```

## ⚙️ Desarrollo

### Modo Watch (Auto-reload)
```bash
npm run dev
```

El bot se reiniciará automáticamente al detectar cambios.

### Modo Producción
```bash
npm start
```

### Con PM2 (Múltiples Procesos/Sharding)
```bash
# Inicia
npm run pm2:start

# Para
npm run pm2:stop

# Ver logs
npm run pm2:logs
```

## 📊 Configuración de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Obligatorio
DISCORD_TOKEN=tu_token_aqui
DATABASE_URL=file:./prisma/bot.db
ENVIRONMENT=development

# Opcional
GUILD_ID=           # ID de guild para desarrollo (comandos instantáneos)
NODE_ENV=development
```

**Nota**: En desarrollo con `GUILD_ID` configurado, los comandos se registran al instante. Sin él (o en producción), esperarás ~30 min de latencia en la API de Discord.

## 🏛️ Arquitectura

Esta aplicación sigue **arquitectura por capas** estricta:

```
┌─────────────────────────────────────────┐
│      Discord API (Events, Intents)      │
├─────────────────────────────────────────┤
│  Commands & Events (Handlers)           │
├─────────────────────────────────────────┤
│  Systems (Orquestación)                 │
├─────────────────────────────────────────┤
│  Domains (Lógica) | Services | Database │
├─────────────────────────────────────────┤
│  Core (Bootstrap, Config, Logger)       │
└─────────────────────────────────────────┘
```

**Ventajas**:
- ✅ Testeable
- ✅ Mantenible
- ✅ Escalable
- ✅ Reutilizable

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para un análisis profundo.

## 🔐 Seguridad

- ✅ Validaciones explícitas en entradas
- ✅ Auditoría de acciones administrativas
- ✅ Rate limiting integrado
- ✅ Sin ejecución de código dinámico
- ✅ Permisos Discord respetados

## 📚 Documentación

- [**Arquitectura Detallada**](docs/ARCHITECTURE.md) - Diseño, capas y decisiones
- [**Guía de Comandos**](docs/COMMANDS.md) - Cómo crear comandos
- [**Changelog**](docs/CHANGELOG.md) - Historial de versiones

## 📦 Stack Tecnológico

| Librería | Versión | Propósito |
|----------|---------|-----------|
| discord.js | ^14.25.1 | Cliente Discord |
| @prisma/client | ^6.5.0 | ORM + Migraciones |
| pino | ^9.6.0 | Logger estructurado |
| dotenv | ^16.4.7 | Gestión de variables de entorno |

## 🛠️ Scripts Disponibles

```bash
npm start                 # Inicia el bot
npm run dev              # Modo watch (auto-reload)
npm run db:generate      # Genera Prisma client
npm run db:migrate:dev   # Corre migraciones (desarrollo)
npm run db:migrate:deploy # Corre migraciones (producción)
npm run db:seed          # Ejecuta script seed (si existe)
npm run pm2:start        # Inicia con PM2
npm run pm2:stop         # Detiene PM2
npm run pm2:logs         # Ve logs de PM2
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Commit tus cambios (`git commit -m "feat: mi feature"`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

Respeta la estructura modular y las convenciones de arquitectura.

## 📄 Licencia

ISC - Ver `package.json` para más detalles.

## 👤 Autor

Desarrollado con ❤️ para la comunidad .

## 📞 Soporte

Si encuentras problemas:
- 📖 Revisa la [documentación](docs/)
- 🐛 Abre un [Issue](https://github.com/J3lk5d0x3l/SCRATH/issues)

### 🎮 Servidor de Soporte

¿Necesitas ayuda? ¡Únete a nuestro servidor de Discord!

[![Servidor de Discord](https://img.shields.io/badge/Discord-SCRAT%20Support-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/KGDvEZYWYf)

[Haz clic aquí para unirte al servidor](https://discord.gg/KGDvEZYWYf)

---

**Hecho con ❤️ | SCRACH LLC Discord Bot**
