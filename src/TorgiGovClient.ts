import axios from 'axios';
import { BidTypes, MetaData, Subjects } from './types';
import config from './config';

export default class TorgiGovClient {
  // TODO

  async getBidTypes(): Promise<Array<string>> {
    const { data } = await axios.get<BidTypes>(
      'new/opendata/7710568760-masterData/docs/biddType_6aa523d1-3804-4250-ae2b-e682b559589d.json',
      {
        timeout: 10 * 1000,
        baseURL: config.torgiGovBaseUrl,
      },
    );

    return data.exportObject.structuredObject.masterData.NSI.map(
      ({ biddType }) => biddType.name,
    );
  }

  async getMeta(): Promise<MetaData> {
    const { data } = await axios.get<MetaData>(
      'new/opendata/7710568760-notice/meta.json',
      {
        timeout: 10 * 1000,
        baseURL: config.torgiGovBaseUrl,
      },
    );

    return data;
  }

  async getSubjects(): Promise<Array<string>> {
    const { data } = await axios.get<Subjects>(
      'new/opendata/710568760-masterData/docs/regionSubject_d2436cc2-699e-4145-be99-021aae943186.json',
      {
        timeout: 10 * 1000,
        baseURL: config.torgiGovBaseUrl,
      },
    );

    return data.exportObject.structuredObject.masterData.NSI.map(
      (i) => i.regionSubject.name,
    );
  }
}

const bla = new TorgiGovClient();

(async () => {
  console.log(await bla.getSubjects());
})();
