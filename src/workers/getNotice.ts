import axios, { AxiosResponse } from 'axios';
import { Job } from 'bullmq';

import IJobProcessor from '../types/IJobProcessor';
import { GetNoticeJobBody, NoticeResponse } from '../types';
import Notice from '../models/Notice';
import Lot from '../models/Lot';
import pAll from 'p-all';
import Region from '../models/Region';

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

  const notice = data.exportObject.structuredObject.notice;
  const noticeNumber = notice.commonInfo.noticeNumber;

  await Notice.query().insert({
    noticeNumber,
    bidType: notice.commonInfo.biddType.name,
    bidForm: notice.commonInfo.biddForm.name,
    publishedAt: new Date(notice.commonInfo.publishDate),
    procedureName: notice.commonInfo.procedureName,
    href: notice.commonInfo.href,
  });

  if (notice.lots) {
    await pAll(
      notice.lots.map((lot) => async (): Promise<void> => {
        await Region.query()
          .insert({
            code: lot.biddingObjectInfo.subjectRF.code,
            name: lot.biddingObjectInfo.subjectRF.name,
          })
          .onConflict()
          .ignore();

        await Lot.query().insert({
          noticeNumber,
          status: lot.lotStatus,
          name: lot.lotName,
          description: lot.lotDescription,
          priceMin: lot.priceMin,
          priceStep: lot.priceStep,
          deposit: lot.deposit,
          currency: lot.currency.name,
          regionCode: lot.biddingObjectInfo.subjectRF.code,
          estateAddress: lot.biddingObjectInfo.estateAddress,
        });
      }),
      { concurrency: 10 },
    );
  }
}
