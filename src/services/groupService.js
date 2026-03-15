import * as groupRepo from '../repositories/groupSettingsRepository.js';
import { validateGroupSettingsData } from '../utils/validators.js';
import logger from '../utils/logger.js';

export function configureGroup(data) {
  const validation = validateGroupSettingsData(data);

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const settings = groupRepo.upsertGroupSettings(data);
  logger.info({ groupId: data.group_id }, 'Group settings configured');

  return settings;
}

export function getGroupConfig(groupId) {
  const settings = groupRepo.getGroupSettings(groupId);

  if (!settings) {
    return {
      group_id: groupId,
      send_hour: 9,
      timezone: 'America/Argentina/Cordoba',
      default_template: null,
      enabled: 1
    };
  }

  return settings;
}

export function listAllGroups() {
  return groupRepo.getGroupsWithBirthdays();
}

export function listConfiguredGroups() {
  return groupRepo.getAllGroupSettings(false);
}

export function updateGroupConfig(groupId, updates) {
  const success = groupRepo.updateGroupSettings(groupId, updates);

  if (success) {
    logger.info({ groupId, updates }, 'Group settings updated');
  }

  return success;
}

export function deleteGroupConfig(groupId) {
  const success = groupRepo.deleteGroupSettings(groupId);

  if (success) {
    logger.info({ groupId }, 'Group settings deleted');
  }

  return success;
}

export function getActiveGroups() {
  return groupRepo.getAllGroupSettings(true);
}
