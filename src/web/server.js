import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as birthdayService from '../services/birthdayService.js';
import * as groupService from '../services/groupService.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.webPort;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Get all birthdays
app.get('/api/birthdays', (req, res) => {
  try {
    const birthdays = birthdayService.listBirthdays(false);
    res.json({ success: true, data: birthdays });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting birthdays');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get birthday by ID
app.get('/api/birthdays/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const birthday = birthdayService.getBirthdayDetails(id);
    res.json({ success: true, data: birthday });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting birthday');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add birthday
app.post('/api/birthdays', (req, res) => {
  try {
    const { name, birth_date, group_id, group_name, message_template } = req.body;

    if (!name || !birth_date || !group_id || !group_name) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: name, birth_date, group_id, group_name'
      });
    }

    const birthday = birthdayService.addBirthday({
      name,
      birth_date,
      group_id,
      group_name,
      message_template
    });

    res.json({ success: true, data: birthday });
  } catch (error) {
    logger.error({ error: error.message }, 'Error adding birthday');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update birthday
app.put('/api/birthdays/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    // Update each field
    for (const [field, value] of Object.entries(updates)) {
      if (field !== 'id' && field !== 'created_at') {
        birthdayService.updateBirthdayField(id, field, value);
      }
    }

    const updated = birthdayService.getBirthdayDetails(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error: error.message }, 'Error updating birthday');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete birthday
app.delete('/api/birthdays/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    birthdayService.removeBirthday(id);
    res.json({ success: true, message: 'Cumpleaños eliminado' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error deleting birthday');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle birthday status
app.patch('/api/birthdays/:id/toggle', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { enabled } = req.body;
    birthdayService.toggleBirthdayStatus(id, enabled);
    res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error toggling birthday');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all groups
app.get('/api/groups', (req, res) => {
  try {
    const groups = groupService.listAllGroups();
    res.json({ success: true, data: groups });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting groups');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configure group
app.post('/api/groups/config', (req, res) => {
  try {
    const { group_id, group_name, send_hour, timezone } = req.body;

    if (!group_id || send_hour === undefined || !timezone) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: group_id, send_hour, timezone'
      });
    }

    groupService.configureGroup({
      group_id,
      group_name: group_name || 'Configurado',
      send_hour: parseInt(send_hour, 10),
      timezone
    });

    res.json({ success: true, message: 'Grupo configurado' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error configuring group');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

export function startWebServer() {
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, '🌐 Web server started');
    console.log(`\n🌐 Panel web disponible en: http://localhost:${PORT}`);
    console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
  });

  return server;
}

export default app;
