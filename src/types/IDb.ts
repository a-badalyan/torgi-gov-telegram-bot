import { MongoClient } from 'mongodb';

export default interface IDb {
  client: MongoClient;
  dbName: string;
}
