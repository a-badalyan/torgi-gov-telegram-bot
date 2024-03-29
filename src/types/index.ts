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

export type NSI =
  | 'penaltyType'
  | 'noticeChangeReason'
  | 'contractType'
  | 'biddType'
  | 'structuredDocumentType'
  | 'timeZones'
  | 'selectNSI'
  | 'penaltyReason'
  | 'contractRefusalReason'
  | 'contractTerminationFoundation'
  | 'annulmentReasons'
  | 'electronicPlatform'
  | 'contractTerminationReason'
  | 'specifications'
  | 'paymentType'
  | 'contractKind'
  | 'budgetLevel'
  | 'ownershipForms'
  | 'refusalAdmissionReasons'
  | 'abandonedReason'
  | 'contractInvalidatingReason'
  | 'cancelReason'
  | 'attachmentType'
  | 'stopReason'
  | 'categories'
  | 'regionSubject';

export type MasterData = {
  listObjects: Array<{
    NSIType: NSI;
    startDate: string;
    endDate: string;
    href: string;
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

export type PrepareTelegramNotificationJobBody = {
  notice: DbNotificationAdvanced;
};

export type SendTelegramNotificationJobBody = {
  telegramId: number;
  notice: DbNotificationCommon;
};

export type AddLotJob = {
  noticeNumber: string;
  lot: LotType;
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

export type LotType = {
  lotNumber: number;
  lotStatus: string;
  lotName: string;
  lotDescription: string;
  priceMin?: string | null;
  priceStep?: string | null;
  deposit?: string | null;
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
  currency: { code: string; name: string };
  biddingObjectInfo: {
    subjectRF: { code: number; name: string };
    estateAddress: string;
    category: { code: string; name: string };
    isCompound: boolean;
    ownershipForms: { code: string; name: string };
    characteristics: Array<{
      code: string;
      name: string;
      characteristicValue: any;
      OKEI?: { code: string; name: string } | null;
    }>;
  };
  additionalDetails: Array<{
    code: string;
    name: string;
    value: any;
  }>;
};

export type NoticeResponse = {
  exportObject: {
    structuredObject: {
      notice: {
        schemeVersion: string;
        id: string;
        rootId: string;
        version: number;
        commonInfo: {
          noticeNumber: string;
          biddType?: {
            code: string;
            name: string;
          };
          biddForm?: { code: string; name: string };
          publishDate: string;
          procedureName?: string;
          etp?: {
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
        lots?: Array<LotType>;
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

export type DbNotificationCommon = {
  noticeNumber: string;
  bidderOrg: string;
  procedureName: string;
  biddType: string;
  biddForm: string;
  publishDate: string;
  href: string;
};

export type DbLot = {
  lotNumber: number;
  lotStatus: string;
  lotName: string;
  lotDescription: string;
  priceMin?: string | null;
  priceStep?: string | null;
  deposit?: string | null;
  currency: string;
  subjectRF: string;
  estateAddress: string;
  category: string;
  characteristics: Array<{
    name: string;
    characteristicValue: any;
    OKEI?: string | null;
  }>;
};

export type DbNotificationAdvanced = DbNotificationCommon & {
  lots?: Array<DbLot>;
  biddConditions: {
    biddStartTime: string;
    biddEndTime: string;
    biddReviewDate: string;
    startDate: string;
  };
  contactInfo: {
    contPerson: string;
    tel: string;
    email: string;
  };
};

export type DbClient = {
  telegramId: number;
  firstFame: string;
  lastName?: string | null;
  username?: string | null;
  bidTypes: Array<string>;
  subjectsRF: Array<string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export enum Collections {
  NOTIFICATIONS = 'notifications',
  CLIENTS = 'clients',
}

export enum TGCommands {
  START = '/start',
  INFO = '/info',
  SET_REGION = '/set_region',
  SET_NOTICE_TYPE = '/set_notice_type',
  RESET_FILTERS = '/reset_filters',
}

export type BidTypes = {
  exportObject: {
    structuredObject: {
      masterData: {
        schemeVersion: string;
        NSI: Array<{
          biddType: {
            code: string;
            name: string;
          };
        }>;
      };
    };
  };
};

export type Subjects = {
  exportObject: {
    structuredObject: {
      masterData: {
        schemeVersion: string;
        NSI: Array<{
          regionSubject: {
            code: string;
            name: string;
            OKATO: string;
            published: boolean;
          };
        }>;
      };
    };
  };
};

export type GenericOkResponse = {
  status: 'OK';
};

export type GenericErrorResponse = {
  status: 'ERROR' | 'INTERNAL_ERROR';
  error_code: string;
  error_message?: string | null;
};
