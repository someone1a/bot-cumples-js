import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import crypto from 'crypto';
import * as birthdayService from '../services/birthdayService.js';
import * as groupService from '../services/groupService.js';
import { isSocketConnected, getCurrentQR } from '../bot/socket.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';
import { updateWebPanelPassword } from '../utils/passwordGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.webPort;

// Session management
const activeSessions = new Map(); // sessionId -> { token, expiresAt, validated }
const pendingQRs = new Map(); // qrId -> { sessionId, expiresAt }

app.use(cors());
app.use(express.json());

// Authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required', requiresAuth: true });
  }

  const token = authHeader.substring(7);

  // Check if it's the master password
  if (token === config.webPanelPassword) {
    return next();
  }

  // Check if it's a valid session token
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.token === token && session.validated && session.expiresAt > Date.now()) {
      return next();
    }
  }

  return res.status(401).json({ success: false, error: 'Invalid or expired token', requiresAuth: true });
};

// Public routes
app.use(express.static(path.join(__dirname, 'public')));

// Check if authentication is required
app.get('/api/auth/check', (req, res) => {
  res.json({
    success: true,
    requiresAuth: true
  });
});

// Verify password
app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;

  if (password === config.webPanelPassword) {
    return res.json({ success: true, valid: true });
  }

  res.json({ success: true, valid: false });
});

// Generate QR code for login
app.post('/api/auth/qr/generate', async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const qrId = crypto.randomBytes(8).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');

    // Create session (not validated yet)
    activeSessions.set(sessionId, {
      token,
      validated: false,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Create QR mapping
    pendingQRs.set(qrId, {
      sessionId,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Generate QR code URL
    const qrData = `${req.protocol}://${req.get('host')}/api/auth/qr/validate/${qrId}?password=${config.webPanelPassword}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 300 });

    logger.info({ sessionId, qrId }, 'QR code generated for login');

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        sessionId,
        expiresIn: 300000 // 5 minutes in ms
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error generating QR code');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate QR code (when scanned)
app.get('/api/auth/qr/validate/:qrId', (req, res) => {
  const { qrId } = req.params;
  const { password } = req.query;

  const qrData = pendingQRs.get(qrId);

  if (!qrData) {
    return res.status(404).send('<html><body><h1>QR Code no válido o expirado</h1></body></html>');
  }

  if (qrData.expiresAt < Date.now()) {
    pendingQRs.delete(qrId);
    return res.status(410).send('<html><body><h1>QR Code expirado</h1></body></html>');
  }

  if (password !== config.webPanelPassword) {
    return res.status(401).send('<html><body><h1>Contraseña incorrecta</h1></body></html>');
  }

  // Validate the session
  const session = activeSessions.get(qrData.sessionId);
  if (session) {
    session.validated = true;
    session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Extend to 24 hours
    pendingQRs.delete(qrId);
    logger.info({ sessionId: qrData.sessionId }, 'QR code validated successfully');
  }

  res.send('<html><body><h1 style="color: green;">✓ Autenticación exitosa</h1><p>Puedes cerrar esta ventana</p></body></html>');
});

// Check session status
app.get('/api/auth/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.json({ success: true, validated: false, expired: true });
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(sessionId);
    return res.json({ success: true, validated: false, expired: true });
  }

  res.json({
    success: true,
    validated: session.validated,
    expired: false,
    token: session.validated ? session.token : null
  });
});

// Protected API Routes

// Get all birthdays
app.get('/api/birthdays', requireAuth, (req, res) => {
  try {
    const birthdays = birthdayService.listBirthdays(false);
    res.json({ success: true, data: birthdays });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting birthdays');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get birthday by ID
app.get('/api/birthdays/:id', requireAuth, (req, res) => {
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
app.post('/api/birthdays', requireAuth, (req, res) => {
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
app.put('/api/birthdays/:id', requireAuth, (req, res) => {
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
app.delete('/api/birthdays/:id', requireAuth, (req, res) => {
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
app.patch('/api/birthdays/:id/toggle', requireAuth, (req, res) => {
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
app.get('/api/groups', requireAuth, (req, res) => {
  try {
    const groups = groupService.listAllGroups();
    res.json({ success: true, data: groups });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting groups');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get WhatsApp groups from socket
app.get('/api/whatsapp/groups', requireAuth, async (req, res) => {
  try {
    const socket = await import('../bot/socket.js');
    const sock = socket.getSocket();

    if (!sock) {
      return res.status(503).json({
        success: false,
        error: 'Bot not connected to WhatsApp'
      });
    }

    const groups = await sock.groupFetchAllParticipating();
    const groupList = Object.values(groups).map(group => ({
      id: group.id,
      name: group.subject,
      participants: group.participants.length
    }));

    res.json({ success: true, data: groupList });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting WhatsApp groups');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configure group
app.post('/api/groups/config', requireAuth, (req, res) => {
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

// Get connection status and QR code
app.get('/api/connection', requireAuth, (req, res) => {
  try {
    const connected = isSocketConnected();
    const qr = getCurrentQR();

    res.json({
      success: true,
      data: {
        connected,
        qr: qr || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting connection status');
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change password
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren currentPassword y newPassword'
      });
    }

    if (currentPassword !== config.webPanelPassword) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 4 caracteres'
      });
    }

    updateWebPanelPassword(newPassword);

    config.webPanelPassword = newPassword;

    activeSessions.clear();

    logger.info('Password changed successfully');

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente. Por favor, inicia sesión nuevamente.'
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error changing password');
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
    console.log(`\n🔐 CONTRASEÑA DEL PANEL WEB:`);
    console.log(`   ${config.webPanelPassword}`);
    console.log(`\n⚠️  Guarda esta contraseña en un lugar seguro.`);
    console.log(`   También está en el archivo .env (WEB_PANEL_PASSWORD)`);
  });

  return server;
}

export default app;
