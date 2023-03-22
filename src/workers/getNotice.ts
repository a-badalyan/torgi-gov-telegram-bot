import axios, { AxiosResponse } from 'axios';
import { Job } from 'bullmq';
import fs from 'fs';
import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, MetaData } from '../types';

export default async function getNotice(
  this: IJobProcessor,
  job: Job<GetNoticeJobBody>,
): Promise<void> {
  this.log.info({ msg: 'daily_notices_job_start' });
  const { data }: AxiosResponse<MetaData> = await axios.get(job.data.href, {
    timeout: 10 * 1000,
  });

  const date = Date.now();

  // fs.writeFileSync(
  //   `${__dirname}/${date}.ts`,
  //   `export default ${JSON.stringify(data)}`,
  // );
}
