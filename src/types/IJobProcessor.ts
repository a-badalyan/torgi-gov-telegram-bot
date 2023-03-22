import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { Logger } from 'pino';

export default interface IJobProcessor {
  log: Logger;
  redisClient: Redis;
  bullQueues: Record<string, Queue>;
  bullWorkers: Record<string, Worker>;
}
