import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import { SendTelegramNotificationJobBody } from '../types';

export default async function sendTelegramNotification(
  this: IJobProcessor,
  job: Job<SendTelegramNotificationJobBody>,
): Promise<void> {
  this.log.info({ msg: 'send_telegram_notification_job_start' });

  const { telegramId, notice } = job.data;

  const message =
    `${notice.noticeNumber}\n` +
    `Организатор: ${notice.bidderOrg}\n` +
    `Тип торгов: ${notice.biddType}\n` +
    `Форма торгов: ${notice.biddForm}\n` +
    `Наименование: ${notice.procedureName}\n` +
    `Дата публикации: ${notice.publishDate}\n` +
    `${notice.href}`;

  await this.telegramClient.bot.sendMessage(telegramId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Получить лоты',
            callback_data: `lots_${notice.noticeNumber}`,
          },
        ],
      ],
    },
  });
}
