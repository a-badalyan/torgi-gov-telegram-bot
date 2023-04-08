import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { Logger } from 'pino';
import Db from '../Db';
import TelegramClient from '../TelegramClient';

export default interface IJobProcessor {
  log: Logger;
  db: Db;
  telegramClient: TelegramClient;
  redisClient: Redis;
  bullQueues: Record<string, Queue>;
  bullWorkers: Record<string, Worker>;
}
