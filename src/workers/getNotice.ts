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
  this.log.info({ msg: 'daily_notices_job_start' });
  const { data } = await axios.get<NoticeResponse>(job.data.href, {
    timeout: 10 * 1000,
  });

  const notice = toAdvancedNotification(data);

  await this.db.notificationCollection.insertOne(notice);

  await this.bullQueues[PREPARE_TELEGRAM_NOTIFICATION].add(
    PREPARE_TELEGRAM_NOTIFICATION,
    { notice },
    { jobId: notice.noticeNumber },
  );
}
