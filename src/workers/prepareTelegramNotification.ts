import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import {
  DbClient,
  PrepareTelegramNotificationJobBody,
  SendTelegramNotificationJobBody,
} from '../types';
import pAll from 'p-all';
import { SEND_TELEGRAM_NOTIFICATION } from '../constants';
import { Filter } from 'mongodb';

export default async function prepareTelegramNotification(
  this: IJobProcessor,
  job: Job<PrepareTelegramNotificationJobBody>,
): Promise<void> {
  this.log.info({ msg: 'prepare_telegram_notification_job_start' });

  const notice = job.data.notice;

  if (!notice.lots) {
    return;
  }

  // TODO: filter by bidType

  const query: Filter<DbClient> = {
    isActive: true,
    bidTypes: notice.biddType,
    subjectsRF: notice.lots[0].subjectRF,
  };

  const clients = await this.db.clientCollection.find(query).toArray();

  if (clients.length > 0) {
    this.log.info({ msg: 'got_clients', length: clients.length });

    await pAll(
      clients.map((client) => async (): Promise<void> => {
        const body: SendTelegramNotificationJobBody = {
          telegramId: client.telegramId,
          notice,
        };

        await this.bullQueues[SEND_TELEGRAM_NOTIFICATION].add(
          SEND_TELEGRAM_NOTIFICATION,
          body,
          { jobId: job.data.notice.noticeNumber },
        );
      }),
    );
  }
}
