import pino from 'pino';
import config from '../config/env.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logsDir = join(process.cwd(), 'storage', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = join(logsDir, 'app.log');

const targets = [
  {
    target: 'pino-pretty',
    level: config.logLevel,
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      destination: 1
    }
  },
  {
    target: 'pino/file',
    level: config.logLevel,
    options: {
      destination: logFile,
      mkdir: true
    }
  }
];

const logger = pino({
  level: config.logLevel,
  transport: {
    targets
  }
});

export default logger;
