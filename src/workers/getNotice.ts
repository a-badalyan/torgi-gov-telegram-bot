import axios, { AxiosResponse } from 'axios';
import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, NoticeResponse } from '../types';
import { toAdvancedNotification } from '../modifiers/toAdvancedNotification';

export default async function getNotice(
  this: IJobProcessor,
  job: Job<GetNoticeJobBody>,
): Promise<void> {
  this.log.info({ msg: 'daily_notices_job_start' });
  const { data }: AxiosResponse<NoticeResponse> = await axios.get(
    job.data.href,
    {
      timeout: 10 * 1000,
    },
  );

  const notification = data.exportObject.structuredObject.notice;

  await this.db.notificationCollection.insertOne(toAdvancedNotification(data));

  this.log.info({
    msg: `notification_${notification.commonInfo.noticeNumber}_added`,
  });
}
