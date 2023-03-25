import axios, { AxiosResponse } from 'axios';
import pAll from 'p-all';
import config from '../config';
import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, MetaData } from '../types';
import { GET_DAILY_NOTICES } from '../constants';

export default async function getMeta(this: IJobProcessor): Promise<void> {
  const { data }: AxiosResponse<MetaData> = await axios.get(
    'new/opendata/7710568760-notice/meta.json',
    {
      timeout: 10 * 1000,
      baseURL: config.torgiGovBaseUrl,
    },
  );

  // TOOD: get and check from DB
  const today = new Date(new Date().setUTCHours(0, 0, 0, 0))
    .toISOString()
    .replace(/[-, :]/g, '')
    .slice(0, 13);

  await pAll(
    data.data
      .filter((n) => n.created === today)
      .map((notificication) => async (): Promise<void> => {
        this.log.info({ msg: `notification_${notificication.created}_pushed` });

        const body: GetNoticeJobBody = {
          href: notificication.source,
        };

        await this.bullQueues[GET_DAILY_NOTICES].add(GET_DAILY_NOTICES, body);
      }),
    { concurrency: 30 },
  );
}
