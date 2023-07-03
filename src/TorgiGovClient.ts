import axios from 'axios';
import {
  BidTypes,
  GenericErrorResponse,
  GenericOkResponse,
  MasterData,
  MetaData,
  Subjects,
} from './types';

export default class TorgiGovClient {
  private readonly torgiGovBaseUrl: string;

  constructor({ torgiGovBaseUrl }: { torgiGovBaseUrl: string }) {
    this.torgiGovBaseUrl = torgiGovBaseUrl;
  }

  private errorHandler(error: unknown): GenericErrorResponse {
    if (axios.isAxiosError(error)) {
      return {
        status: 'ERROR',
        error_code: 'AXIOS_ERROR',
        error_message: error.message,
      };
    }

    return {
      status: 'ERROR',
      error_code: 'INTERNAL_ERROR',
      error_message: error instanceof Error ? error.message : 'unknown_error',
    };
  }

  async getBidTypes(): Promise<
    (GenericOkResponse & { biddTypes: Array<string> }) | GenericErrorResponse
  > {
    try {
      const meta = await this.getMetaMasterData();

      const masterDataResponse = await axios.get<MasterData>(
        meta.data[0].source,
        {
          timeout: 10 * 1000,
        },
      );

      const biddTypeInfo = masterDataResponse.data.listObjects.find(
        (i) => i.NSIType === 'biddType',
      );

      if (!biddTypeInfo) {
        throw new Error('missing_biddtype');
      }

      const { data } = await axios.get<BidTypes>(biddTypeInfo.href);

      const biddTypes = data.exportObject.structuredObject.masterData.NSI.map(
        ({ biddType }) => biddType.name,
      );

      return {
        status: 'OK',
        biddTypes,
      };
    } catch (error: unknown) {
      return this.errorHandler(error);
    }
  }

  async getMetaNotice(): Promise<MetaData> {
    const { data } = await axios.get<MetaData>('7710568760-notice/meta.json', {
      timeout: 10 * 1000,
      baseURL: this.torgiGovBaseUrl,
    });

    return data;
  }

  private async getMetaMasterData(): Promise<MetaData> {
    const { data } = await axios.get<MetaData>(
      '7710568760-masterData/meta.json',
    );

    return data;
  }

  async getSubjects(): Promise<
    (GenericOkResponse & { subjects: Array<string> }) | GenericErrorResponse
  > {
    try {
      const meta = await this.getMetaMasterData();

      const masterDataResponse = await axios.get<MasterData>(
        meta.data[0].source,
        {
          timeout: 10 * 1000,
          baseURL: this.torgiGovBaseUrl,
        },
      );

      const subjectsInfo = masterDataResponse.data.listObjects.find(
        (i) => i.NSIType === 'regionSubject',
      );

      if (!subjectsInfo) {
        throw new Error('missing_region_subject');
      }

      const { data } = await axios.get<Subjects>(subjectsInfo.href, {
        timeout: 10 * 1000,
      });

      const subjects = data.exportObject.structuredObject.masterData.NSI.map(
        ({ regionSubject }) => regionSubject.name,
      );

      return {
        status: 'OK',
        subjects,
      };
    } catch (error: unknown) {
      return this.errorHandler(error);
    }
  }
}
