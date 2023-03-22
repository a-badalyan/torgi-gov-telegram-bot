import axios, { AxiosResponse } from 'axios';
import { Job } from 'bullmq';
import fs from 'fs';
import IJobProcessor from '../types/IJobProcessor';
import { DailyNotices, GetNoticeJobBody } from '../types';
import pAll from 'p-all';
import { GET_NOTICE } from '../constants';

export default async function getDailyNotices(
  this: IJobProcessor,
  job: Job<GetNoticeJobBody>,
): Promise<void> {
  this.log.info({ msg: 'notice_job_start' });
  const { data }: AxiosResponse<DailyNotices> = await axios.get(job.data.href, {
    timeout: 10 * 1000,
  });

  const date = Date.now();

  await pAll(
    data.listObjects.map((notice) => async (): Promise<void> => {
      const body: GetNoticeJobBody = { href: notice.href };

      await this.bullQueues[GET_NOTICE].add(GET_NOTICE, body);
    }),
  );
}
