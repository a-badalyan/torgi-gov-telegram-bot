import axios, { AxiosResponse } from 'axios';
import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, NoticeResponse } from '../types';
import { notificationModel } from '../models/notification.model';

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

  const notification = data.exportObject.structuredObject.notice.commonInfo;

  new notificationModel({
    noticeNumber: notification.noticeNumber,
    bidType: notification.biddType,
    bidForm: notification.biddForm,
    publishedAt: notification.publishDate,
    procedureName: notification.procedureName,
    href: notification.href,
  }).save();

  this.log.info({
    msg: `notification_${notification.noticeNumber}_added`,
  });
}
