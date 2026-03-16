import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  timezone: process.env.TZ || 'America/Argentina/Cordoba',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'America/Argentina/Cordoba',

  authorizedNumbers: (process.env.AUTHORIZED_NUMBERS || process.env.ADMIN_NUMBERS || '')
    .split(',')
    .map(num => num.trim())
    .filter(num => num.length > 0),

  logLevel: process.env.LOG_LEVEL || 'info',

  dbPath: process.env.DB_PATH || './storage/database.sqlite',

  schedulerCheckInterval: parseInt(process.env.SCHEDULER_CHECK_INTERVAL || '1', 10),

  webEnabled: process.env.WEB_ENABLED !== 'false',
  webPort: parseInt(process.env.WEB_PORT || '3000', 10),

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production'
};

if (config.authorizedNumbers.length === 0) {
  console.warn('⚠️  WARNING: No authorized numbers configured. Bot commands will not work!');
}

export default config;
