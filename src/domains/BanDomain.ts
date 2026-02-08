/**
 * BanDomain: Lógica pura de bans
 */

export interface BanReason {
  reason: string;
  severity: 'baja' | 'media' | 'alta';
}

export function isValidBanReason(reason: string): boolean {
  return !!(reason && reason.length > 0 && reason.length <= 512);
}

export function getBanSeverity(reason: string): 'baja' | 'media' | 'alta' {
  if (reason.toLowerCase().includes('spam') || reason.toLowerCase().includes('flood')) return 'media';
  if (reason.toLowerCase().includes('hack') || reason.toLowerCase().includes('exploit')) return 'alta';
  return 'baja';
}
