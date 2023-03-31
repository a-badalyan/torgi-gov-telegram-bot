import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import Logger from 'pino';
import util from 'util';
import config from './config';
import JobProcessor from './JobProcessor';
import mongoose from 'mongoose';

const log = Logger({
  level: config.logLevel,
});

log.level = config.logLevel;

const redisClient = new Redis(config.redisUri, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on('error', (error: unknown) => {
  log.error({
    msg: 'redis_client_error',
    error,
  });
});

redisClient.setMaxListeners(50);

const bullQueues: Record<string, Queue> = {};
const bullWorkers: Record<string, Worker> = {};

const jobProcessor = new JobProcessor({
  log,
  bullQueues,
  bullWorkers,
  redisClient,
});

jobProcessor.installJobsAndWorkers();

process.on('uncaughtException', (err: Error) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught Exception:', util.inspect(err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

(async () => {
  mongoose
    .connect(config.mongoUri, {})
    .then(() => log.info('connected_to_mongodb'))
    .catch((err) => console.error(err));

  await jobProcessor.start();

  log.info({ msg: 'service_started' });
})();
