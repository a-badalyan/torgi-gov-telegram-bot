import { Collection, MongoClient } from 'mongodb';

import IDb from './types/IDb';
import { Collections, DbNotificationAdvanced } from './types';

export default class Db implements IDb {
  client: MongoClient;
  dbName: string;
  notificationCollection: Collection<DbNotificationAdvanced>;

  constructor({ client, dbName }: { client: MongoClient; dbName: string }) {
    this.client = client;
    this.dbName = dbName;
    this.notificationCollection = this.client
      .db(this.dbName)
      .collection(Collections.NOTIFICATIONS);
  }

  // comment
  async connect(): Promise<void> {
    await this.client.connect();

    this.client.db(this.dbName);

    await this.notificationCollection.createIndex({ '$**': 'text' });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
