import axios from 'axios';
import { Job } from 'bullmq';
import IJobProcessor from '../types/IJobProcessor';
import { DailyNotices, GetNoticeJobBody } from '../types';
import pAll from 'p-all';
import { GET_NOTICE } from '../constants';

export default async function getDailyNotices(
  this: IJobProcessor,
  job: Job<GetNoticeJobBody>,
): Promise<void> {
  this.log.info({ msg: 'get_daily_notices' });

  const { data } = await axios.get<DailyNotices>(job.data.href, {
    timeout: 10 * 1000,
  });

  await pAll(
    data.listObjects.map((notice) => async (): Promise<void> => {
      const body: GetNoticeJobBody = { href: notice.href };

      await this.bullQueues[GET_NOTICE].add(GET_NOTICE, body, {
        jobId: notice.regNum,
        removeOnComplete: 500,
        removeOnFail: false,
      });
    }),
    { concurrency: 30 },
  );
}
