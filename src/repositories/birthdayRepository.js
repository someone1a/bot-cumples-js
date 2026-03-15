import { getDatabase } from '../config/database.js';

export function createBirthday(data) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO birthdays (name, birth_date, group_id, group_name, message_template, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.name,
    data.birth_date,
    data.group_id,
    data.group_name,
    data.message_template || null,
    data.enabled !== undefined ? data.enabled : 1
  );

  return { id: info.lastInsertRowid, ...data };
}

export function getAllBirthdays(enabledOnly = false) {
  const db = getDatabase();
  const query = enabledOnly
    ? 'SELECT * FROM birthdays WHERE enabled = 1 ORDER BY birth_date'
    : 'SELECT * FROM birthdays ORDER BY birth_date';

  return db.prepare(query).all();
}

export function getBirthdayById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM birthdays WHERE id = ?').get(id);
}

export function getBirthdaysByDate(monthDay) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM birthdays
    WHERE enabled = 1
    AND substr(birth_date, 6, 5) = ?
    ORDER BY name
  `).all(monthDay);
}

export function getBirthdaysByGroupId(groupId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM birthdays
    WHERE group_id = ?
    ORDER BY birth_date
  `).all(groupId);
}

export function updateBirthday(id, updates) {
  const db = getDatabase();
  const allowedFields = ['name', 'birth_date', 'group_id', 'group_name', 'message_template', 'enabled'];
  const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  values.push(id);

  const stmt = db.prepare(`
    UPDATE birthdays
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const info = stmt.run(...values);
  return info.changes > 0;
}

export function deleteBirthday(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM birthdays WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getUpcomingBirthdays(limit = 10) {
  const db = getDatabase();

  const today = new Date();
  const currentMonthDay = today.toISOString().substring(5, 10);

  return db.prepare(`
    SELECT *,
      CASE
        WHEN substr(birth_date, 6, 5) >= ? THEN substr(birth_date, 6, 5)
        ELSE '9999' || substr(birth_date, 6, 5)
      END as sort_key
    FROM birthdays
    WHERE enabled = 1
    ORDER BY sort_key
    LIMIT ?
  `).all(currentMonthDay, limit);
}

export function importBirthdays(birthdays) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO birthdays (name, birth_date, group_id, group_name, message_template, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(
        item.name,
        item.birth_date,
        item.group_id,
        item.group_name,
        item.message_template || null,
        item.enabled !== undefined ? item.enabled : 1
      );
    }
  });

  insertMany(birthdays);
}
