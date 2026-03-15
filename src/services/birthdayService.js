import * as birthdayRepo from '../repositories/birthdayRepository.js';
import * as sentLogRepo from '../repositories/sentLogRepository.js';
import { validateBirthdayData } from '../utils/validators.js';
import { getTodayMonthDay, getCurrentYear } from '../utils/dateUtils.js';
import logger from '../utils/logger.js';

export function addBirthday(data) {
  const validation = validateBirthdayData(data);

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  try {
    const birthday = birthdayRepo.createBirthday(data);
    logger.info({ birthdayId: birthday.id, name: data.name }, 'Birthday added successfully');
    return birthday;
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Birthday already exists for this person in this group');
    }
    throw error;
  }
}

export function listBirthdays(enabledOnly = true) {
  return birthdayRepo.getAllBirthdays(enabledOnly);
}

export function getBirthdayDetails(id) {
  const birthday = birthdayRepo.getBirthdayById(id);
  if (!birthday) {
    throw new Error(`Birthday with id ${id} not found`);
  }
  return birthday;
}

export function updateBirthdayField(id, field, value) {
  const birthday = birthdayRepo.getBirthdayById(id);
  if (!birthday) {
    throw new Error(`Birthday with id ${id} not found`);
  }

  const allowedFields = ['name', 'birth_date', 'group_id', 'group_name', 'message_template', 'enabled'];
  if (!allowedFields.includes(field)) {
    throw new Error(`Field '${field}' cannot be updated. Allowed: ${allowedFields.join(', ')}`);
  }

  const updates = { [field]: value };
  const success = birthdayRepo.updateBirthday(id, updates);

  if (success) {
    logger.info({ birthdayId: id, field, value }, 'Birthday updated successfully');
  }

  return success;
}

export function removeBirthday(id) {
  const birthday = birthdayRepo.getBirthdayById(id);
  if (!birthday) {
    throw new Error(`Birthday with id ${id} not found`);
  }

  const success = birthdayRepo.deleteBirthday(id);

  if (success) {
    logger.info({ birthdayId: id, name: birthday.name }, 'Birthday deleted successfully');
  }

  return success;
}

export function toggleBirthdayStatus(id, enabled) {
  return updateBirthdayField(id, 'enabled', enabled ? 1 : 0);
}

export function getTodaysBirthdays() {
  const today = getTodayMonthDay();
  const birthdays = birthdayRepo.getBirthdaysByDate(today);

  const currentYear = getCurrentYear();
  const filteredBirthdays = birthdays.filter(birthday => {
    return !sentLogRepo.wasSentThisYear(birthday.id, currentYear);
  });

  logger.info(
    { count: filteredBirthdays.length, total: birthdays.length },
    `Found ${filteredBirthdays.length} birthdays to send today (${birthdays.length - filteredBirthdays.length} already sent)`
  );

  return filteredBirthdays;
}

export function getUpcomingBirthdays(limit = 10) {
  return birthdayRepo.getUpcomingBirthdays(limit);
}

export function markBirthdayAsSent(birthdayId, groupId) {
  const currentYear = getCurrentYear();
  const log = sentLogRepo.createSentLog(birthdayId, groupId, currentYear);

  if (log) {
    logger.info({ birthdayId, groupId, year: currentYear }, 'Birthday marked as sent');
  } else {
    logger.warn({ birthdayId, groupId, year: currentYear }, 'Birthday was already marked as sent');
  }

  return log;
}

export function exportBirthdays() {
  const birthdays = birthdayRepo.getAllBirthdays(false);
  return birthdays;
}

export function importBirthdaysFromJson(jsonData) {
  if (!Array.isArray(jsonData)) {
    throw new Error('Import data must be an array');
  }

  const validBirthdays = [];
  const errors = [];

  for (let i = 0; i < jsonData.length; i++) {
    const item = jsonData[i];
    const validation = validateBirthdayData(item);

    if (validation.valid) {
      validBirthdays.push(item);
    } else {
      errors.push({ index: i, errors: validation.errors, data: item });
    }
  }

  if (validBirthdays.length > 0) {
    birthdayRepo.importBirthdays(validBirthdays);
    logger.info({ count: validBirthdays.length }, 'Birthdays imported successfully');
  }

  return {
    imported: validBirthdays.length,
    errors: errors.length,
    errorDetails: errors
  };
}
