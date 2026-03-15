import { getDatabase } from '../config/database.js';

export function createGroupSettings(data) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO group_settings (group_id, group_name, send_hour, timezone, default_template, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.group_id,
    data.group_name,
    data.send_hour || 9,
    data.timezone || 'America/Argentina/Cordoba',
    data.default_template || null,
    data.enabled !== undefined ? data.enabled : 1
  );

  return { id: info.lastInsertRowid, ...data };
}

export function getGroupSettings(groupId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM group_settings WHERE group_id = ?').get(groupId);
}

export function getAllGroupSettings(enabledOnly = false) {
  const db = getDatabase();
  const query = enabledOnly
    ? 'SELECT * FROM group_settings WHERE enabled = 1 ORDER BY group_name'
    : 'SELECT * FROM group_settings ORDER BY group_name';

  return db.prepare(query).all();
}

export function updateGroupSettings(groupId, updates) {
  const db = getDatabase();

  const existing = getGroupSettings(groupId);
  if (!existing) {
    return false;
  }

  const allowedFields = ['group_name', 'send_hour', 'timezone', 'default_template', 'enabled'];
  const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  values.push(groupId);

  const stmt = db.prepare(`
    UPDATE group_settings
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE group_id = ?
  `);

  const info = stmt.run(...values);
  return info.changes > 0;
}

export function upsertGroupSettings(data) {
  const existing = getGroupSettings(data.group_id);

  if (existing) {
    const updates = {};
    if (data.group_name !== undefined) updates.group_name = data.group_name;
    if (data.send_hour !== undefined) updates.send_hour = data.send_hour;
    if (data.timezone !== undefined) updates.timezone = data.timezone;
    if (data.default_template !== undefined) updates.default_template = data.default_template;
    if (data.enabled !== undefined) updates.enabled = data.enabled;

    if (Object.keys(updates).length > 0) {
      updateGroupSettings(data.group_id, updates);
    }

    return { ...existing, ...updates };
  } else {
    return createGroupSettings(data);
  }
}

export function deleteGroupSettings(groupId) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM group_settings WHERE group_id = ?');
  const info = stmt.run(groupId);
  return info.changes > 0;
}

export function getGroupsWithBirthdays() {
  const db = getDatabase();
  return db.prepare(`
    SELECT DISTINCT b.group_id, b.group_name, gs.send_hour, gs.timezone, gs.enabled as settings_enabled
    FROM birthdays b
    LEFT JOIN group_settings gs ON b.group_id = gs.group_id
    WHERE b.enabled = 1
    ORDER BY b.group_name
  `).all();
}
