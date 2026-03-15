import cron from 'node-cron';
import * as birthdayService from './birthdayService.js';
import * as groupService from './groupService.js';
import * as messageService from './messageService.js';
import { isTimeToSend } from '../utils/dateUtils.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';

let schedulerTask = null;
let botSocket = null;

export function startScheduler(sock) {
  if (schedulerTask) {
    logger.warn('Scheduler is already running');
    return;
  }

  botSocket = sock;

  const intervalMinutes = config.schedulerCheckInterval;
  const cronExpression = `*/${intervalMinutes} * * * *`;

  schedulerTask = cron.schedule(cronExpression, async () => {
    await checkAndSendBirthdays();
  });

  logger.info({ interval: `${intervalMinutes} minute(s)` }, 'Birthday scheduler started');
}

export function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    botSocket = null;
    logger.info('Birthday scheduler stopped');
  }
}

async function checkAndSendBirthdays() {
  try {
    logger.debug('Scheduler: Checking for birthdays to send...');

    if (!botSocket) {
      logger.warn('Scheduler: Bot socket not available, skipping check');
      return;
    }

    const todaysBirthdays = birthdayService.getTodaysBirthdays();

    if (todaysBirthdays.length === 0) {
      logger.debug('Scheduler: No birthdays to send today');
      return;
    }

    const groupedBirthdays = groupBirthdaysByGroup(todaysBirthdays);

    for (const [groupId, birthdays] of Object.entries(groupedBirthdays)) {
      const groupSettings = groupService.getGroupConfig(groupId);

      if (!groupSettings.enabled) {
        logger.debug({ groupId }, 'Scheduler: Group is disabled, skipping');
        continue;
      }

      const shouldSend = isTimeToSend(groupSettings.send_hour, groupSettings.timezone);

      if (!shouldSend) {
        logger.debug(
          {
            groupId,
            sendHour: groupSettings.send_hour,
            timezone: groupSettings.timezone
          },
          'Scheduler: Not the right time to send for this group'
        );
        continue;
      }

      logger.info(
        {
          groupId,
          count: birthdays.length
        },
        `Scheduler: Sending ${birthdays.length} birthday(s) to group`
      );

      for (const birthday of birthdays) {
        const result = await messageService.sendBirthdayMessage(botSocket, birthday);

        if (result.success) {
          birthdayService.markBirthdayAsSent(birthday.id, groupId);
        }

        await sleep(1000);
      }
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Scheduler: Error checking birthdays');
  }
}

function groupBirthdaysByGroup(birthdays) {
  const grouped = {};

  for (const birthday of birthdays) {
    if (!grouped[birthday.group_id]) {
      grouped[birthday.group_id] = [];
    }
    grouped[birthday.group_id].push(birthday);
  }

  return grouped;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getSchedulerStatus() {
  return {
    running: !!schedulerTask,
    interval: `${config.schedulerCheckInterval} minute(s)`
  };
}
