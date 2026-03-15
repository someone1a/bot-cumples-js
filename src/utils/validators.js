import { isValidDate } from './dateUtils.js';

export function validateBirthdayData(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.birth_date || !isValidDate(data.birth_date)) {
    errors.push('birth_date must be a valid date in YYYY-MM-DD format');
  }

  if (!data.group_id || typeof data.group_id !== 'string' || data.group_id.trim().length === 0) {
    errors.push('group_id is required and must be a non-empty string');
  }

  if (!data.group_name || typeof data.group_name !== 'string' || data.group_name.trim().length === 0) {
    errors.push('group_name is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateGroupSettingsData(data) {
  const errors = [];

  if (!data.group_id || typeof data.group_id !== 'string' || data.group_id.trim().length === 0) {
    errors.push('group_id is required');
  }

  if (!data.group_name || typeof data.group_name !== 'string' || data.group_name.trim().length === 0) {
    errors.push('group_name is required');
  }

  if (data.send_hour !== undefined) {
    const hour = parseInt(data.send_hour, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      errors.push('send_hour must be a number between 0 and 23');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .substring(0, 500);
}

export function isAdmin(phoneNumber, adminNumbers) {
  if (!phoneNumber || !Array.isArray(adminNumbers)) {
    return false;
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');

  return adminNumbers.some(admin => {
    const cleanAdmin = admin.replace(/\D/g, '');
    return cleanNumber === cleanAdmin || cleanNumber.endsWith(cleanAdmin);
  });
}
