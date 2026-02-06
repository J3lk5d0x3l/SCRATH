// src/services/healthCheckServer.js
// HTTP Health check endpoint for monitoring and load balancers

import express from 'express';

let server = null;
let app = null;
let healthService = null;

/**
 * Start health check HTTP server
 * @param {number} port Port to listen on
 * @param {Object} health Health service instance
 * @returns {Promise<void>}
 */
export async function startHealthCheckServer(port = 3000, health) {
  return new Promise((resolve, reject) => {
    try {
      healthService = health;
      app = express();

      // Middleware
      app.use(express.json());

      // Route: Simple health check (for load balancers)
      app.get('/health', async (req, res) => {
        const status = await healthService.getSimpleHealth();
        const statusCode = status.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(status);
      });

      // Route: Detailed health check
      app.get('/health/details', async (req, res) => {
        const status = await healthService.getHealthStatus();
        const statusCode = status.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(status);
      });

      // Route: Readiness check (is bot ready?)
      app.get('/readiness', async (req, res) => {
        const status = await healthService.getHealthStatus();
        const ready = status.bot.ready;
        res.status(ready ? 200 : 503).json({ ready });
      });

      // Route: Liveness check (is process alive?)
      app.get('/liveness', (req, res) => {
        res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
      });

      // Start server
      server = app.listen(port, () => {
        console.log(`🏥 Health check server running on port ${port}`);
        resolve();
      });
    } catch (error) {
      console.error('Error starting health check server:', error);
      reject(error);
    }
  });
}

/**
 * Stop health check server
 * @returns {Promise<void>}
 */
export async function stopHealthCheckServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('🏥 Health check server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export default {
  startHealthCheckServer,
  stopHealthCheckServer,
};
