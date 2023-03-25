import { Model } from 'objection';

export default class Notice extends Model {
  static tableName = 'notices';
  static idColumn = 'id';

  id!: number;
  noticeNumber!: string;
  bidType!: string;
  bidForm!: string;
  publishedAt!: Date;
  procedureName: string;
  href: string;
}
