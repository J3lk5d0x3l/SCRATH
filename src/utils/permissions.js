// src/utils/permissions.js
// Helpers para validación de permisos

import { PermissionsBitField } from 'discord.js';

/**
 * Verifica si un miembro tiene ciertos permisos
 */
export function hasPermissions(member, requiredPermissions) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return true;
  }
  return requiredPermissions.every(perm =>
    member.permissions.has(perm)
  );
}

/**
 * Obtiene permisos faltantes
 */
export function getMissingPermissions(member, requiredPermissions) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return [];
  }
  return requiredPermissions.filter(perm => !member.permissions.has(perm));
}

/**
 * Convierte array de permission strings a nombres legibles
 */
export function permissionNames(permissions) {
  const names = {
    SEND_MESSAGES: 'Enviar mensajes',
    EMBED_LINKS: 'Insertar links',
    MANAGE_GUILD: 'Administrar servidor',
    MODERATE_MEMBERS: 'Moderar miembros',
    MANAGE_ROLES: 'Administrar roles',
    BAN_MEMBERS: 'Banear miembros',
  };
  return permissions.map(p => names[p] || p);
}

export { PermissionsBitField };
