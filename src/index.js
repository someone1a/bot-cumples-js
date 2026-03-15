import config from './config/env.js';
import { initDatabase, closeDatabase } from './config/database.js';
import { connectToWhatsApp, disconnect } from './bot/socket.js';
import logger from './utils/logger.js';

process.env.TZ = config.timezone;

async function main() {
  try {
    logger.info('🚀 Starting WhatsApp Birthday Bot...');
    logger.info({ env: config.nodeEnv, timezone: config.timezone }, 'Environment configuration loaded');

    initDatabase(config.dbPath);
    logger.info({ path: config.dbPath }, 'Database initialized successfully');

    await connectToWhatsApp();

    if (process.send) {
      process.send('ready');
    }

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Fatal error during startup');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await shutdown();
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await shutdown();
});

process.on('uncaughtException', (error) => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught exception');
  shutdown().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
});

async function shutdown() {
  try {
    logger.info('Shutting down...');

    disconnect();

    closeDatabase();

    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message }, 'Error during shutdown');
    process.exit(1);
  }
}

main();
