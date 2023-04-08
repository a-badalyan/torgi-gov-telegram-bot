import TelegramBot from 'node-telegram-bot-api';
import Db from './Db';
import { Logger } from 'pino';
import { TGCommands } from './types';

export default class TelegramClient {
  log: Logger;
  db: Db;
  bot: TelegramBot;

  constructor({ log, db, bot }: { log: Logger; db: Db; bot: TelegramBot }) {
    this.log = log;
    this.db = db;
    this.bot = bot;
  }

  async init(): Promise<void> {
    this.bot.setMyCommands([
      { command: TGCommands.START, description: 'Начальное приветствие' },
      {
        command: TGCommands.INFO,
        description: 'Получить информацию о пользователе',
      },
    ]);

    this.bot.on('message', async (msg) => {
      const text = msg.text;
      const client = msg.from;

      if (!client) {
        this.log.warn({ msg: 'missing_client' });

        return;
      }

      if (client.is_bot) {
        this.log.error({ msg: 'bots_prohibited' });

        return;
      }

      if (text === TGCommands.START) {
        this.log.info({ msg: 'got_start_command' });

        this.bot.sendMessage(client.id, 'Вступительное сообщение');

        const dbClient = await this.db.clientCollection.findOne({
          telegramId: client.id,
        });

        if (dbClient) {
          if (dbClient.isActive) {
            return;
          }

          return this.db.clientCollection.updateOne(
            { _id: dbClient._id },
            { isActive: true, updatedAt: new Date() },
          );
        }

        return await this.db.clientCollection.insertOne({
          telegramId: client.id,
          firstFame: client.first_name,
          lastName: client.last_name,
          username: client.username,
          filters: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  }
}
