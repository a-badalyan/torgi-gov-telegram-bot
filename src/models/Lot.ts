import { Model, RelationMappings } from 'objection';

import Notice from './Notice';
import Region from './Region';

export default class Lot extends Model {
  static tableName = 'lots';
  static idColumn = 'id';

  id: number;
  noticeNumber: string;
  status: string;
  name: string;
  description: string;
  priceMin?: string | null;
  priceStep?: string | null;
  deposit?: string | null;
  currency: string;
  regionCode: number;
  estateAddress: string;

  notice?: Notice;
  region?: Region;

  static get relationMappings(): RelationMappings {
    return {
      notice: {
        relation: Model.HasOneRelation,
        modelClass: Notice,
        join: {
          from: 'lots.noticeNumber',
          to: 'notices.noticeNumber',
        },
      },

      region: {
        relation: Model.HasOneRelation,
        modelClass: Region,
        join: {
          from: 'lots.regionCode',
          to: 'regions.code',
        },
      },
    };
  }
}
