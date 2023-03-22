import { Model } from 'objection';

export default class Region extends Model {
  static tableName = 'region';

  static idColumn = 'code';

  code!: number;
  name!: string;
}
