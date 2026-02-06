/**
 * Wrapper mínimo en raíz
 * 
 * Este archivo redirige a src/index.js (punto de entrada real).
 * Permite ejecutar tanto:
 *   node index.js (desde raíz)
 *   npm start (que ejecuta node src/index.js)
 * 
 * Fase 0.2 Hardening
 */

import('./src/index.js').catch(error => {
  console.error('Error crítico al importar src/index.js:', error);
  process.exit(1);
});
