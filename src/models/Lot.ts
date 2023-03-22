import { Model, RelationMappings } from 'objection';

import Notice from './Notice';
import Region from './Region';

export default class Lots extends Model {
  static tableName: 'lots';
  static idColumn: 'id';

  id!: number;
  notice_number!: string;
  status: string;
  name: string;
  description!: string;
  price_min!: string;
  price_step!: Date;
  deposit!: string;
  currency!: string;
  region_code!: number;
  estate_address!: string;

  notice?: Notice;
  region?: Region;

  static get relationMappings(): RelationMappings {
    return {
      notice: {
        relation: Model.HasOneRelation,
        modelClass: Notice,
        join: {
          from: 'lots.notice_number',
          to: 'notices.notice_number',
        },
      },

      region: {
        relation: Model.HasOneRelation,
        modelClass: Region,
        join: {
          from: 'lots.region_code',
          to: 'regions.code',
        },
      },
    };
  }
}
