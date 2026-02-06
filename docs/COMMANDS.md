# Guía de Comandos

## Estructura de un Comando (Plantilla)

```javascript
// src/commands/nombreComando.js
import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../core/container.js';

const command = {
  // Metadata Discord
  data: new SlashCommandBuilder()
    .setName('comando')
    .setDescription('Descripción')
    .setDMPermission(false) // Solo en guilds
    .addStringOption(option =>
      option.setName('opcion')
        .setDescription('Descripción opción')
        .setRequired(true)
    ),

  // Permisos requeridos
  permissions: {
    user: ['SEND_MESSAGES'], // Qué necesita el usuario
    bot: ['SEND_MESSAGES', 'EMBED_LINKS'], // Qué necesita el bot
  },

  // Cooldown
  cooldown: 3, // segundos

  // Handler
  async execute(interaction) {
    const logger = getService('logger');
    const audit = getService('audit');
    const rateLimit = getService('rateLimit');

    try {
      // 1. Validar rate limit
      const rateLimitCheck = rateLimit.checkCommand('comando', interaction.user.id);
      if (!rateLimitCheck.allowed) {
        const embed = {
          color: 0xFF0000,
          title: '⏱ Cooldown',
          description: `Espera ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)}s`,
        };
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // 2. Validar permisos
      // ... validación de permisos

      // 3. Lógica (llama system)
      const resultado = await sistemaUnido.ejecutar(interaction.options.getString('opcion'));

      // 4. Auditar si es sensible
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'COMANDO_EJECUTADO',
        resourceType: 'COMMAND',
        resourceId: 'comando',
        status: 'SUCCESS',
      });

      // 5. Responder (embed en español)
      const embed = {
        color: 0x00FF00,
        title: 'Éxito',
        description: resultado,
      };
      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.error({ error, command: 'comando', userId: interaction.user.id }, 'Error en comando');

      // Audita error
      await audit.log({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        action: 'COMANDO_EJECUTADO',
        status: 'FAILED',
        errorMessage: error.message,
      });

      // Responde al usuario
      const embed = {
        color: 0xFF0000,
        title: '❌ Error',
        description: 'Ocurrió un error. Intenta nuevamente.',
      };
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;
```

## Matriz de Comandos Implementados (Fase 2 + Fase 3 + Fase 4)

| Dominio | Comando | Descripción | Permisos | Status |
|---------|---------|-------------|----------|--------|
| **Utilidad** | `/help` | Lista comandos disponibles | SEND_MESSAGES | ✅ |
| | `/ping` | Latencia del bot | SEND_MESSAGES | ✅ |
| | `/info` | Info del server/usuario | SEND_MESSAGES | ✅ |
| | `/user-info` | Info detallada de usuario | SEND_MESSAGES | ✅ |
| | `/bot-status` | Estadísticas del bot | SEND_MESSAGES | ✅ |
| **Config** | `/config get` | Obtiene settings | MANAGE_GUILD | ✅ |
| | `/config set` | Actualiza settings | MANAGE_GUILD | ✅ |
| | `/logs` | Historial de auditoría | MANAGE_GUILD | ✅ |
| **Moderación** | `/mute` | Silencia usuario | MODERATE_MEMBERS | ✅ |
| | `/unmute` | Dessilencia usuario | MODERATE_MEMBERS | ✅ |
| | `/warn` | Advierte usuario | MODERATE_MEMBERS | ✅ |
| | `/warnings` | Listar advertencias | MODERATE_MEMBERS | ✅ |
| | `/ban` | Banea usuario | BAN_MEMBERS | ✅ |
| | `/unban` | Desbanea usuario | BAN_MEMBERS | ✅ |
| | `/kick` | Expulsa usuario | KICK_MEMBERS | ✅ |
| **Admin** | `/automod` | Config auto-moderación | MANAGE_GUILD | ✅ |
| | `/purge` | Limpia mensajes | MANAGE_MESSAGES | ✅ |
| | `/role-assign` | Asigna/remueve roles | MANAGE_ROLES | ✅ |

**Total: 17 Comandos ✅**

---

## Convenciones

- **Nombres**: snake_case en Discord, camelCase en código
- **Descripciones**: Breves, siempre en español
- **Errores**: Siempre responde al usuario (ephemeral si es error)
- **Auditoría**: Log acciones sensibles (moderación, config, etc)
- **Cooldown**: Define en metadata; valida en execute()

---

**Última actualización**: Alineado con el estado actual del repositorio
