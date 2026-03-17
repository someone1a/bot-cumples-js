import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function generateSecurePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  return password;
}

export function ensureWebPanelPassword() {
  const envPath = path.join(__dirname, '../../.env');
  const defaultPassword = '1234';

  if (!fs.existsSync(envPath)) {
    return defaultPassword;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  const passwordMatch = envContent.match(/^WEB_PANEL_PASSWORD=(.*)$/m);

  if (passwordMatch && passwordMatch[1].trim()) {
    return passwordMatch[1].trim();
  }

  if (passwordMatch) {
    envContent = envContent.replace(
      /^WEB_PANEL_PASSWORD=.*$/m,
      `WEB_PANEL_PASSWORD=${defaultPassword}`
    );
  } else {
    envContent += `\nWEB_PANEL_PASSWORD=${defaultPassword}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');

  return defaultPassword;
}

export function updateWebPanelPassword(newPassword) {
  const envPath = path.join(__dirname, '../../.env');

  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  const passwordMatch = envContent.match(/^WEB_PANEL_PASSWORD=(.*)$/m);

  if (passwordMatch) {
    envContent = envContent.replace(
      /^WEB_PANEL_PASSWORD=.*$/m,
      `WEB_PANEL_PASSWORD=${newPassword}`
    );
  } else {
    envContent += `\nWEB_PANEL_PASSWORD=${newPassword}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');

  return true;
}
