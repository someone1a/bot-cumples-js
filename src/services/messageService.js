import { renderTemplate, getDefaultTemplate } from '../utils/template.js';
import * as groupService from './groupService.js';
import logger from '../utils/logger.js';

export async function sendBirthdayMessage(sock, birthday, isTest = false) {
  try {
    const groupSettings = groupService.getGroupConfig(birthday.group_id);

    let template;
    if (birthday.message_template) {
      template = birthday.message_template;
    } else if (groupSettings.default_template) {
      template = groupSettings.default_template;
    } else {
      template = getDefaultTemplate();
    }

    const message = renderTemplate(template, birthday);

    const jid = `${birthday.group_id}@g.us`;

    await sock.sendMessage(jid, { text: message });

    logger.info(
      {
        birthdayId: birthday.id,
        name: birthday.name,
        groupId: birthday.group_id,
        isTest
      },
      `Birthday message sent ${isTest ? '(TEST)' : ''}`
    );

    return { success: true, message };
  } catch (error) {
    logger.error(
      {
        birthdayId: birthday.id,
        name: birthday.name,
        groupId: birthday.group_id,
        error: error.message
      },
      'Failed to send birthday message'
    );

    return { success: false, error: error.message };
  }
}

export async function sendTextMessage(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text });
    return true;
  } catch (error) {
    logger.error({ jid, error: error.message }, 'Failed to send text message');
    return false;
  }
}
