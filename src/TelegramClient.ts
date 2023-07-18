import TelegramBot from 'node-telegram-bot-api';
import Db from './Db';
import { Logger } from 'pino';
import pAll from 'p-all';

import { TGCommands } from './types';

import TorgiGovClient from './TorgiGovClient';

export default class TelegramClient {
  private readonly log: Logger;
  private readonly db: Db;
  private readonly torgiGovClient: TorgiGovClient;
  public bot: TelegramBot;

  constructor({
    log,
    db,
    bot,
    torgiGovClient,
  }: {
    log: Logger;
    db: Db;
    bot: TelegramBot;
    torgiGovClient: TorgiGovClient;
  }) {
    this.log = log;
    this.db = db;
    this.bot = bot;
    this.torgiGovClient = torgiGovClient;
  }

  async init(): Promise<void> {
    const subjectsResponse = await this.torgiGovClient.getSubjects();
    const bidTypesResponse = await this.torgiGovClient.getBidTypes();

    if (subjectsResponse.status !== 'OK' || bidTypesResponse.status !== 'OK') {
      console.log({ subjectsResponse, bidTypesResponse });
      throw new Error('unable_to_get_data');
    }

    await this.bot.setMyCommands([
      {
        command: TGCommands.INFO,
        description: 'Получить информацию о фильтрах',
      },
      {
        command: TGCommands.SET_REGION,
        description: 'Установить регион',
      },
      {
        command: TGCommands.SET_NOTICE_TYPE,
        description: 'Установить тип торгов',
      },
      {
        command: TGCommands.RESET_FILTERS,
        description: 'Очистить фильтры',
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
        return;
      }

      if (text === TGCommands.START) {
        this.log.info({ msg: 'got_start_command' });

        const dbClient = await this.db.clientCollection.findOne({
          telegramId: client.id,
        });

        if (dbClient) {
          this.log.info({ msg: 'got_client', client: dbClient });

          if (dbClient.isActive) {
            return;
          }

          await this.db.clientCollection.updateOne(
            { _id: dbClient._id },
            { $set: { isActive: true, updatedAt: new Date() } },
          );
        }

        this.log.info({ msg: 'client_not_found_create_new_one' });

        await this.db.clientCollection.insertOne({
          telegramId: client.id,
          firstFame: client.first_name,
          lastName: client.last_name,
          username: client.username,
          bidTypes: [],
          subjectsRF: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.bot.sendMessage(
          client.id,
          'Вы успешно зарегистрированы, пожалуйста установите фильтры уведомлений выполнив команды: /set_region и /set_notice_type',
        );
      }

      if (text === TGCommands.INFO) {
        const dbClient = await this.db.clientCollection.findOne({
          telegramId: client.id,
        });

        if (!dbClient) {
          return;
        }

        const clientInfo =
          `Ваши фильтры:\n` +
          `${'Регионы: ' + dbClient.subjectsRF}\n` +
          `${'Тип торгов: ' + dbClient.bidTypes}`;

        await this.bot.sendMessage(client.id, clientInfo);
      }

      if (text === TGCommands.SET_REGION) {
        const keyboard = subjectsResponse.subjects.map((subject) => [
          { text: subject },
        ]);

        await this.bot.sendMessage(client.id, 'Выберите регион', {
          reply_markup: {
            keyboard,
            one_time_keyboard: true,
          },
        });
      }

      if (text === TGCommands.SET_NOTICE_TYPE) {
        const keyboard = bidTypesResponse.biddTypes.map((bidType) => [
          { text: bidType },
        ]);

        await this.bot.sendMessage(client.id, 'Выберите тип торгов', {
          reply_markup: {
            keyboard,
            one_time_keyboard: true,
          },
        });
      }

      if (text === TGCommands.RESET_FILTERS) {
        await this.db.clientCollection.updateOne(
          { telegramId: client.id },
          {
            $set: {
              updatedAt: new Date(),
              bidTypes: [],
              subjectsRF: [],
            },
          },
        );
      }

      if (text && subjectsResponse.subjects.includes(text)) {
        await this.db.clientCollection.updateOne(
          { telegramId: client.id },
          {
            $set: {
              updatedAt: new Date(),
            },
            $addToSet: {
              subjectsRF: text,
            },
          },
        );
      }

      if (text && bidTypesResponse.biddTypes.includes(text)) {
        await this.db.clientCollection.updateOne(
          { telegramId: client.id },
          {
            $set: {
              updatedAt: new Date(),
            },

            $addToSet: {
              bidTypes: text,
            },
          },
        );
      }
    });

    this.bot.on('callback_query', async (msg) => {
      const { data } = msg;

      if (!data) {
        return;
      }

      if (data.startsWith('lots_')) {
        const noticeNumber = data.replace('lots_', '');

        const notice = await this.db.notificationCollection.findOne({
          noticeNumber,
        });

        if (!notice) {
          return;
        }

        const messages = notice.lots?.map(
          (lot) =>
            `Наименование лота: ${lot.lotName}\n` +
            `Описание: ${lot.lotDescription}\n` +
            `Начальная цена: ${lot.priceMin ?? ''}\n` +
            `Шаг: ${lot.priceStep ?? ''}\n` +
            `Депозит: ${lot.deposit ?? ''}\n` +
            `Валюта: ${lot.currency}\n` +
            `Субъект РФ: ${lot.subjectRF}\n` +
            `Адрес: ${lot.estateAddress}\n` +
            `Категория лота: ${lot.category}`,
        );

        if (messages) {
          await pAll(
            messages.map((m) => async (): Promise<void> => {
              try {
                await this.bot.sendMessage(msg.from.id, m, {
                  reply_to_message_id: msg.message?.message_id,
                });
              } catch (err: unknown) {
                this.log.error({
                  msg: 'send_message_error',
                  error_message: (err as Error).message,
                });
              }
            }),
          );
        }
      }
    });
  }
}
