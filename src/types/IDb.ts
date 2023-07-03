import { Collection, MongoClient } from 'mongodb';
import { DbNotificationAdvanced, DbClient } from '.';

export default interface IDb {
  client: MongoClient;
  dbName: string;
  notificationCollection: Collection<DbNotificationAdvanced>;
  clientCollection: Collection<DbClient>;
}
