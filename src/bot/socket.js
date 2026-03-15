import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import logger from '../utils/logger.js';
import { handleIncomingMessage } from './handlers.js';
import { startScheduler, stopScheduler } from '../services/schedulerService.js';

let sock = null;
let isConnected = false;
let shouldReconnect = true;

export async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./storage/auth');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      printQRInTerminal: false,
      logger,
      browser: ['Birthday Bot', 'Chrome', '120.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n📱 Scan this QR code with WhatsApp:\n');
        qrcode.generate(qr, { small: true });
        logger.info('QR code generated, waiting for scan...');
      }

      if (connection === 'close') {
        const shouldReconnectNow = shouldReconnect &&
          (lastDisconnect?.error instanceof Boom)
            ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            : true;

        if (shouldReconnectNow) {
          logger.warn('Connection closed, reconnecting...');
          isConnected = false;
          stopScheduler();

          setTimeout(() => {
            connectToWhatsApp();
          }, 5000);
        } else {
          logger.info('Connection closed. Logged out or reconnection disabled.');
          isConnected = false;
          stopScheduler();
        }
      }

      if (connection === 'open') {
        logger.info('✅ Connected to WhatsApp successfully!');
        isConnected = true;

        startScheduler(sock);
      }

      if (connection === 'connecting') {
        logger.info('Connecting to WhatsApp...');
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type === 'notify') {
        for (const message of messages) {
          await handleIncomingMessage(sock, message);
        }
      }
    });

    logger.info('WhatsApp bot initialization started');

  } catch (error) {
    logger.error({ error: error.message }, 'Failed to connect to WhatsApp');

    if (shouldReconnect) {
      setTimeout(() => {
        logger.info('Retrying connection...');
        connectToWhatsApp();
      }, 10000);
    }
  }
}

export function getSocket() {
  return sock;
}

export function isSocketConnected() {
  return isConnected;
}

export function disconnect() {
  shouldReconnect = false;
  stopScheduler();

  if (sock) {
    sock.end(undefined);
    logger.info('Disconnected from WhatsApp');
  }
}
