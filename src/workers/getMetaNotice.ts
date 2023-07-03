import pAll from 'p-all';
import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody } from '../types';
import { GET_DAILY_NOTICES } from '../constants';

export default async function getMeta(this: IJobProcessor): Promise<void> {
  // TOOD: get and check from DB

  const data = await this.torgiGovClient.getMetaNotice();

  await pAll(
    data.data
      .slice(data.data.length - 2, data.data.length)
      .map((notification) => async (): Promise<void> => {
        this.log.info({ msg: `notification_${notification.created}_pushed` });

        const body: GetNoticeJobBody = {
          href: notification.source,
        };

        await this.bullQueues[GET_DAILY_NOTICES].add(GET_DAILY_NOTICES, body, {
          jobId: notification.provenance,
        });
      }),
    { concurrency: 30 },
  );
}
