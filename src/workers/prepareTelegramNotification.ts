import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import {
  ClientFiltersFields,
  PrepareTelegramNotificationJobBody,
  SendTelegramNotificationJobBody,
} from '../types';
import pAll from 'p-all';
import { SEND_TELEGRAM_NOTIFICATION } from '../constants';

export default async function prepareTelegramNotification(
  this: IJobProcessor,
  job: Job<PrepareTelegramNotificationJobBody>,
): Promise<void> {
  this.log.info({ msg: 'prepare_telegram_notification_job_start' });

  const notice = job.data.notice;

  if (!notice.lots) {
    return;
  }

  const clients = await this.db.clientCollection
    .find({
      isActive: true,
      $and: [
        [
          {
            filters: {
              $in: [
                {
                  field: ClientFiltersFields.BID_TYPE,
                  value: notice.biddType,
                },
              ],
            },
          },
          {
            filters: {
              $in: [
                {
                  field: ClientFiltersFields.SUBJECT_RF,
                  value:
                    notice.lots.length > 1
                      ? notice.lots[0].subjectRF
                      : 'undefined',
                },
              ],
            },
          },
        ],
      ],
    })
    .toArray();

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
