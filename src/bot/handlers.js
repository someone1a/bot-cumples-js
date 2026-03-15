import { parseCommand } from './commands.js';
import { isAdmin } from '../utils/validators.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export async function handleIncomingMessage(sock, message) {
  try {
    if (!message.message) return;

    const messageText = extractMessageText(message);
    if (!messageText) return;

    const sender = message.key.remoteJid;
    const senderNumber = extractPhoneNumber(message);

    logger.debug(
      {
        from: senderNumber,
        isGroup: sender.endsWith('@g.us'),
        message: messageText
      },
      'Message received'
    );

    if (!messageText.startsWith('/')) {
      return;
    }

    if (!isAdmin(senderNumber, config.adminNumbers)) {
      logger.warn({ sender: senderNumber }, 'Non-admin user attempted to use command');
      return;
    }

    logger.info({ sender: senderNumber, command: messageText }, 'Admin command received');

    await parseCommand(sock, message, messageText);

  } catch (error) {
    logger.error({ error: error.message }, 'Error handling incoming message');
  }
}

function extractMessageText(message) {
  const messageContent = message.message;

  if (messageContent.conversation) {
    return messageContent.conversation;
  }

  if (messageContent.extendedTextMessage?.text) {
    return messageContent.extendedTextMessage.text;
  }

  return null;
}

function extractPhoneNumber(message) {
  const participant = message.key.participant;
  const remoteJid = message.key.remoteJid;

  const jid = participant || remoteJid;

  return jid.split('@')[0];
}
