export type MetaData = {
  standardversion: string;
  identifier: string;
  title: string;
  description: string;
  creator: string;
  created: string;
  modified: string;
  subject: string;
  format: string;
  data: Array<{
    source: string;
    created: string;
    provenance: string;
    valid: string;
    structure: string;
  }>;
};

type NoticeDocumentType =
  | 'noticeCancel'
  | 'notice'
  | 'clarifications'
  | 'noticeStop'
  | 'noticeResumption';

export type MetaResponse = {
  standardversion: string;
  identifier: string;
  title: string;
  description: string;
  creator: string;
  created: string;
  modified: string;
  subject: string;
  format: string;
  data: Array<{
    source: string;
    created: string;
    provenance: string;
    valid: string;
    structure: string;
  }>;
};

export type GetDailyNoticesJobBody = {
  source: string;
};

export type GetNoticeJobBody = {
  href: string;
};

export type DailyNotices = {
  listObjects: Array<{
    bidderOrgCode: string;
    rightHolderCode: string;
    documentType: NoticeDocumentType;
    regNum: string;
    publishDate: string;
    href: string;
  }>;
};

export type Notice = {
  exportObject: {
    structuredObject: {
      notice: {
        schemeVersion: string;
        id: string;
        rootId: string;
        version: number;
        commonInfo: {
          noticeNumber: string;
          biddType: {
            // TODO: enum
            // code: '200FZ';
            code: string;
            name: string;
          };
          // biddForm: { code: 'EA'; name: 'Электронный аукцион' };
          biddForm: { code: string; name: string };
          publishDate: string;
          procedureName: string;
          etp: {
            code: string;
            name: string;
          };
          href: string;
        };
        bidderOrg: {
          orgInfo: {
            code: string;
            name: string;
            INN: string;
            KPP: string;
            OGRN: string;
            orgType: string;
            legalAddress: string;
            actualAddress: string;
          };
          contactInfo: {
            contPerson: string;
            tel: string;
            email: string;
          };
        };
        rightHolderInfo: {
          biddOrgRightHolder: boolean;
          rightHolderOrg: {
            code: string;
            name: string;
            INN: string;
            KPP: string;
            OGRN: string;
            orgType: string;
            legalAddress: string;
            actualAddress: string;
          };
        };
        lots: Array<{
          lotNumber: number;
          // lotStatus: 'PUBLISHED';
          lotStatus: string;
          lotName: string;
          lotDescription: string;
          priceMin: string;
          priceStep: string;
          deposit: string;
          accountsRequisites: {
            electronicPlatform: boolean;
            recipient: {
              name: string;
              INN: string;
              KPP: string;
            };
            bankName: string;
            BIK: string;
            payAccount: string;
            corAccount: string;
            purposePayment: string;
          };
          // currency: { code: '643'; name: 'Российский рубль' };
          currency: { code: string; name: string };
          biddingObjectInfo: {
            // subjectRF: { code: '5'; name: 'Республика Дагестан' };
            subjectRF: { code: string; name: string };
            estateAddress: string;
            // category: { code: '304'; name: 'Земли лесного фонда' };
            category: { code: string; name: string };
            isCompound: boolean;
            // ownershipForms: { code: '12'; name: 'Федеральная собственность' };
            ownershipForms: { code: string; name: string };
            characteristics: Array<{
              code: string;
              name: string;
              characteristicValue: any;
              // OKEI?: { code: '055'; name: 'Квадратный метр' };
              OKEI?: { code: string; name: string } | null;
            }>;
          };
          additionalDetails: Array<{
            code: string;
            name: string;
            value: any;
          }>;
        }>;
        biddConditions: {
          biddStartTime: string;
          biddEndTime: string;
          biddReviewDate: string;
          startDate: string;
        };
        timeZone: { code: string; name: string };
      };
    };
  };
};
