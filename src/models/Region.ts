import { Model } from 'objection';

export default class Region extends Model {
  static tableName = 'regions';

  static idColumn = 'code';

  code: number;
  name: string;
}
