import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bullmq';
import express, { Application } from 'express';
import { Logger } from 'pino';

export class HttpServer {
  expressApp: Application;
  log: Logger;
  port: number;
  bullQueues: Record<string, Queue>;

  constructor({
    log,
    port,
    bullQueues,
  }: {
    log: Logger;
    port: number;
    bullQueues: Record<string, Queue>;
  }) {
    this.expressApp = express();
    this.log = log;
    this.port = port;
    this.bullQueues = bullQueues;
  }

  async start(): Promise<void> {
    this.expressApp.listen(this.port, '0.0.0.0');
    this.log.info('server_started');

    const expressAdapter = new ExpressAdapter();
    expressAdapter.setBasePath('/admin/queues');
    createBullBoard({
      serverAdapter: expressAdapter,
      queues: Object.values(this.bullQueues).map(
        (queue) => new BullMQAdapter(queue),
      ),
    });
    this.expressApp.use('/admin/queues', expressAdapter.getRouter());
  }
}
