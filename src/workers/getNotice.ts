import axios from 'axios';
import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, NoticeResponse } from '../types';
import { toAdvancedNotification } from '../modifiers/toAdvancedNotification';
import { PREPARE_TELEGRAM_NOTIFICATION } from '../constants';

export default async function getNotice(
  this: IJobProcessor,
  job: Job<GetNoticeJobBody>,
): Promise<void> {
  this.log.info({ msg: 'get_notice' });
  const { data } = await axios.get<NoticeResponse>(job.data.href, {
    timeout: 10 * 1000,
  });

  const notice = toAdvancedNotification(data);

  try {
    await this.db.notificationCollection.insertOne(notice);
  } catch (err) {
    // TODO
    this.log.error({ msg: (err as Error).message });
  }

  await this.bullQueues[PREPARE_TELEGRAM_NOTIFICATION].add(
    PREPARE_TELEGRAM_NOTIFICATION,
    { notice },
    { jobId: notice.noticeNumber },
  );
}
