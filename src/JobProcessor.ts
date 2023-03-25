import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { Logger } from 'pino';
import { GET_META, GET_DAILY_NOTICES, GET_NOTICE } from './constants';

import IJobProcessor from './types/IJobProcessor';
import getMeta from './workers/getMeta';
import getDailyNotices from './workers/getDailyNotices';
import getNotice from './workers/getNotice';

export default class JobProcessor implements IJobProcessor {
  log: Logger;

  redisClient: Redis;

  bullQueues: Record<string, Queue>;

  bullWorkers: Record<string, Worker>;

  constructor({
    log,
    redisClient,
    bullQueues,
    bullWorkers,
  }: {
    log: Logger;
    redisClient: Redis;
    bullQueues: Record<string, Queue>;
    bullWorkers: Record<string, Worker>;
  }) {
    this.log = log;
    this.redisClient = redisClient;
    this.bullQueues = bullQueues;
    this.bullWorkers = bullWorkers;
  }

  installJobsAndWorkers(): void {
    const connection = this.redisClient;

    this.bullQueues[GET_DAILY_NOTICES] = new Queue(GET_DAILY_NOTICES, {
      connection,
    });

    this.bullWorkers[GET_DAILY_NOTICES] = new Worker(
      GET_DAILY_NOTICES,
      getDailyNotices.bind(this),
      {
        connection,
      },
    );

    this.bullQueues[GET_META] = new Queue(GET_META, {
      connection,
    });

    this.bullWorkers[GET_META] = new Worker(GET_META, getMeta.bind(this), {
      connection,
    });

    this.bullQueues[GET_NOTICE] = new Queue(GET_NOTICE, {
      connection,
    });

    this.bullWorkers[GET_NOTICE] = new Worker(
      GET_NOTICE,
      getNotice.bind(this),
      {
        connection,
      },
    );
  }

  async start(): Promise<void> {
    await this.bullQueues[GET_META].add(
      GET_META,
      {},
      {
        repeat: {
          every: 5 * 1000,
        },
        removeOnComplete: 100,
      },
    );
  }
}
