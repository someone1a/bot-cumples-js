import { getDatabase } from '../config/database.js';

export function createSentLog(birthdayId, groupId, year) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO sent_logs (birthday_id, group_id, year)
    VALUES (?, ?, ?)
  `);

  try {
    const info = stmt.run(birthdayId, groupId, year);
    return { id: info.lastInsertRowid, birthday_id: birthdayId, group_id: groupId, year };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return null;
    }
    throw error;
  }
}

export function wasSentThisYear(birthdayId, year) {
  const db = getDatabase();
  const result = db.prepare(`
    SELECT id FROM sent_logs
    WHERE birthday_id = ? AND year = ?
  `).get(birthdayId, year);

  return !!result;
}

export function getSentLogsByYear(year) {
  const db = getDatabase();
  return db.prepare(`
    SELECT sl.*, b.name, b.group_name
    FROM sent_logs sl
    JOIN birthdays b ON sl.birthday_id = b.id
    WHERE sl.year = ?
    ORDER BY sl.sent_at DESC
  `).all(year);
}

export function getAllSentLogs(limit = 100) {
  const db = getDatabase();
  return db.prepare(`
    SELECT sl.*, b.name, b.group_name
    FROM sent_logs sl
    JOIN birthdays b ON sl.birthday_id = b.id
    ORDER BY sl.sent_at DESC
    LIMIT ?
  `).all(limit);
}

export function deleteSentLogsByBirthdayId(birthdayId) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sent_logs WHERE birthday_id = ?');
  const info = stmt.run(birthdayId);
  return info.changes;
}
