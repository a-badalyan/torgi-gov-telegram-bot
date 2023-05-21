import { Collection, MongoClient } from 'mongodb';

import IDb from './types/IDb';
import { Collections, DbClient, DbNotificationAdvanced } from './types';

export default class Db implements IDb {
  client: MongoClient;
  dbName: string;
  notificationCollection: Collection<DbNotificationAdvanced>;
  clientCollection: Collection<DbClient>;

  constructor({ client, dbName }: { client: MongoClient; dbName: string }) {
    this.client = client;
    this.dbName = dbName;

    this.notificationCollection = this.client
      .db(this.dbName)
      .collection(Collections.NOTIFICATIONS);

    this.clientCollection = this.client
      .db(this.dbName)
      .collection(Collections.CLIENTS);
  }

  async connect(): Promise<void> {
    await this.client.connect();

    this.client.db(this.dbName);

    await this.notificationCollection.createIndex({ '$**': 'text' });
    await this.clientCollection.createIndex({ telegramId: 1 });
  }

  async migrate(): Promise<void> {
    // TODO

    return;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
