// pm2.config.js
// Configuración PM2 para sharding + process management

export default {
  apps: [
    {
      name: 'discord-bot',
      script: 'src/index.js',
      instances: 1, // Cambia a shardCount para sharding automático
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        SHARD_COUNT: 1,
        SHARD_LIST: '0',
      },
      // Reinicio automático en crash
      autorestart: true,
      max_memory_restart: '500M',
      // Logs
      out_file: 'logs/pm2-out.log',
      error_file: 'logs/pm2-error.log',
      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 10000,
      // Watch mode (desarrollo)
      watch: false, // Activa en dev si quieres auto-reload
      ignore_watch: ['node_modules', 'logs', 'prisma/*.db'],
    },
  ],
};

/*
Uso:
  pm2 start pm2.config.js           # Inicia
  pm2 stop discord-bot              # Detiene
  pm2 restart discord-bot           # Reinicia
  pm2 logs discord-bot              # Logs
  pm2 monit                          # Monitor

Para sharding automático:
  - Cambia instances a: process.env.SHARD_COUNT || 1
  - Discord.js auto-maneja shard assignment via Gateway
*/
