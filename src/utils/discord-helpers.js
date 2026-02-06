// src/utils/discord-helpers.js
// Helpers para interacción con Discord API

/**
 * Obtiene un role silenciador (muted role) de un guild
 * Si no existe, lo crea
 */
export async function getMutedRole(guild, logger) {
  try {
    let mutedRole = guild.roles.cache.find(r => r.name === 'Muteado');

    if (!mutedRole) {
      mutedRole = await guild.roles.create({
        name: 'Muteado',
        color: '#808080',
        permissions: 0n, // Sin permisos
        reason: 'Role para usuarios muteados',
      });
      logger.info({ guildId: guild.id, roleId: mutedRole.id }, 'Muted role creado');
    }

    return mutedRole;
  } catch (error) {
    logger.error({ err: error, guildId: guild.id }, 'Error obteniendo muted role');
    return null;
  }
}

/**
 * Aplica mute a un usuario (añade role + permisos)
 */
export async function applyMute(member, durationMs, reason, logger) {
  try {
    if (!member || !member.manageable) {
      throw new Error('No se puede moderar a este usuario (permisos insuficientes o jerarquía)');
    }

    const mutedRole = await getMutedRole(member.guild, logger);
    if (!mutedRole) {
      throw new Error('No se pudo obtener o crear el role Muteado');
    }

    // Añade role
    await member.roles.add(mutedRole, reason);

    // Timeout (límite: 28 días en Discord)
    const maxTimeout = 2419200000; // 28 días en ms
    const actualTimeout = Math.min(durationMs, maxTimeout);
    
    if (actualTimeout > 0) {
      await member.timeout(actualTimeout, reason);
    }

    logger.info(
      { guildId: member.guild.id, userId: member.id, durationMs },
      'Usuario muteado'
    );

    return { success: true, mutedRole };
  } catch (error) {
    logger.error({ err: error, userId: member?.id }, 'Error aplicando mute');
    throw error;
  }
}

/**
 * Remueve mute de un usuario
 */
export async function removeMute(member, reason, logger) {
  try {
    if (!member || !member.manageable) {
      throw new Error('No se puede moderar a este usuario');
    }

    const mutedRole = member.guild.roles.cache.find(r => r.name === 'Muteado');
    if (mutedRole && member.roles.cache.has(mutedRole.id)) {
      await member.roles.remove(mutedRole, reason);
    }

    // Remueve timeout
    if (member.communicationDisabledUntil) {
      await member.timeout(null, reason);
    }

    logger.info({ guildId: member.guild.id, userId: member.id }, 'Usuario desmuteado');

    return { success: true };
  } catch (error) {
    logger.error({ err: error, userId: member?.id }, 'Error removiendo mute');
    throw error;
  }
}

/**
 * Banea a un usuario del guild
 */
export async function banUser(guild, userId, reason, logger) {
  try {
    await guild.members.ban(userId, { reason });
    logger.info({ guildId: guild.id, userId, reason }, 'Usuario baneado');
    return { success: true };
  } catch (error) {
    logger.error({ err: error, guildId: guild.id, userId }, 'Error baneando usuario');
    throw error;
  }
}

/**
 * Desbanea a un usuario del guild
 */
export async function unbanUser(guild, userId, reason, logger) {
  try {
    await guild.bans.remove(userId, reason);
    logger.info({ guildId: guild.id, userId, reason }, 'Usuario desbaneado');
    return { success: true };
  } catch (error) {
    logger.error({ err: error, guildId: guild.id, userId }, 'Error desbaneando usuario');
    throw error;
  }
}

/**
 * Verifica si un usuario está baneado
 */
export async function isUserBanned(guild, userId, logger) {
  try {
    const ban = await guild.bans.fetch(userId);
    return ban ? true : false;
  } catch {
    return false;
  }
}

/**
 * Obtiene información de un miembro con validaciones
 */
export async function fetchMember(guild, userId, logger) {
  try {
    return await guild.members.fetch(userId);
  } catch (error) {
    logger.debug({ userId }, 'Usuario no en guild');
    return null;
  }
}
