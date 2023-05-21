import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { Logger } from 'pino';
import {
  GET_META,
  GET_DAILY_NOTICES,
  GET_NOTICE,
  SEND_TELEGRAM_NOTIFICATION,
  PREPARE_TELEGRAM_NOTIFICATION,
} from './constants';

import IJobProcessor from './types/IJobProcessor';
import getMeta from './workers/getMeta';
import getDailyNotices from './workers/getDailyNotices';
import getNotice from './workers/getNotice';
import sendTelegramNotification from './workers/sendTelegramNotification';
import Db from './Db';
import TelegramClient from './TelegramClient';
import prepareTelegramNotification from './workers/prepareTelegramNotification';

export default class JobProcessor implements IJobProcessor {
  log: Logger;
  db: Db;
  redisClient: Redis;
  telegramClient: TelegramClient;
  bullQueues: Record<string, Queue>;
  bullWorkers: Record<string, Worker>;

  constructor({
    log,
    db,
    redisClient,
    telegramClient,
    bullQueues,
    bullWorkers,
  }: {
    log: Logger;
    db: Db;
    redisClient: Redis;
    telegramClient: TelegramClient;
    bullQueues: Record<string, Queue>;
    bullWorkers: Record<string, Worker>;
  }) {
    this.log = log;
    this.db = db;
    this.redisClient = redisClient;
    this.telegramClient = telegramClient;
    this.bullQueues = bullQueues;
    this.bullWorkers = bullWorkers;
  }

  installJobsAndWorkers(): void {
    const connection = this.redisClient;

    this.bullQueues[GET_DAILY_NOTICES] = new Queue(GET_DAILY_NOTICES, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        removeOnFail: false,
        backoff: {
          delay: 10 * 1000,
          type: 'fixed',
        },
      },
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
      defaultJobOptions: {
        attempts: 5,
        removeOnFail: false,
        backoff: {
          delay: 10 * 1000,
          type: 'fixed',
        },
      },
    });

    this.bullWorkers[GET_META] = new Worker(GET_META, getMeta.bind(this), {
      connection,
    });

    this.bullQueues[GET_NOTICE] = new Queue(GET_NOTICE, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        removeOnFail: false,
        backoff: {
          delay: 10 * 1000,
          type: 'fixed',
        },
      },
    });

    this.bullWorkers[GET_NOTICE] = new Worker(
      GET_NOTICE,
      getNotice.bind(this),
      {
        connection,
      },
    );

    this.bullQueues[PREPARE_TELEGRAM_NOTIFICATION] = new Queue(
      PREPARE_TELEGRAM_NOTIFICATION,
      {
        connection,
        defaultJobOptions: {
          attempts: 5,
          removeOnFail: false,
          backoff: {
            delay: 10 * 1000,
            type: 'fixed',
          },
        },
      },
    );

    this.bullWorkers[PREPARE_TELEGRAM_NOTIFICATION] = new Worker(
      PREPARE_TELEGRAM_NOTIFICATION,
      prepareTelegramNotification.bind(this),
      {
        connection,
      },
    );

    this.bullQueues[SEND_TELEGRAM_NOTIFICATION] = new Queue(
      SEND_TELEGRAM_NOTIFICATION,
      {
        connection,
        defaultJobOptions: {
          attempts: 5,
          removeOnFail: false,
          backoff: {
            delay: 10 * 1000,
            type: 'fixed',
          },
        },
      },
    );

    this.bullWorkers[SEND_TELEGRAM_NOTIFICATION] = new Worker(
      SEND_TELEGRAM_NOTIFICATION,
      sendTelegramNotification.bind(this),
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

    Object.values(this.bullWorkers).forEach((worker) => {
      worker.on('error', (job) => {
        this.log.error({
          msg: `job_error`,
          job_name: job.name,
          job: job.message,
          job_id: job.stack,
        });
      });
    });
  }
}
