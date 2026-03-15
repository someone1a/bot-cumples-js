import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export function initDatabase(dbPath) {
  const resolvedPath = join(process.cwd(), dbPath);

  const storageDir = dirname(resolvedPath);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');

  createTables();

  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS birthdays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      group_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      message_template TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, birth_date, group_id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      birthday_id INTEGER NOT NULL,
      group_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (birthday_id) REFERENCES birthdays(id) ON DELETE CASCADE,
      UNIQUE(birthday_id, year)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS group_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL UNIQUE,
      group_name TEXT NOT NULL,
      send_hour INTEGER DEFAULT 9,
      timezone TEXT DEFAULT 'America/Argentina/Cordoba',
      default_template TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_birthdays_enabled ON birthdays(enabled);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_birthdays_group_id ON birthdays(group_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sent_logs_birthday_year ON sent_logs(birthday_id, year);
  `);
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
