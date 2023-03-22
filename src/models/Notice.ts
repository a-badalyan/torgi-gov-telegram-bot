import { Model } from 'objection';

export default class Notice extends Model {
  static tableName = 'notices';

  static idColumn = 'id';

  id!: number;
  notice_number!: string;
  bid_type!: string;
  bid_form!: string;
  published_at!: Date;
  procedure_name: string;
  href: string;
}
