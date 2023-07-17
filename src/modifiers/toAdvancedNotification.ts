import { DbNotificationAdvanced, NoticeResponse } from '../types';
import { toDbLot } from './toDbLot';

export function toAdvancedNotification(
  notification: NoticeResponse,
): DbNotificationAdvanced | undefined {
  const notice = notification.exportObject.structuredObject.notice;

  if (
    !notice.commonInfo.biddForm ||
    !notice.commonInfo.biddType ||
    !notice.commonInfo.procedureName
  )
    return undefined;

  return {
    noticeNumber: notice.commonInfo.noticeNumber,
    procedureName: notice.commonInfo.procedureName,
    biddType: notice.commonInfo.biddType.name,
    biddForm: notice.commonInfo.biddForm.name,
    publishDate: notice.commonInfo.publishDate,
    href: notice.commonInfo.href,
    lots: notice.lots?.map((lot) => toDbLot(lot)),
    bidderOrg: notice.bidderOrg.orgInfo.name,
    biddConditions: notice.biddConditions,
    contactInfo: notice.bidderOrg.contactInfo,
  };
}
