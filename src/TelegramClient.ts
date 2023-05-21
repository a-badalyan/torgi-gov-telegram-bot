import TelegramBot from 'node-telegram-bot-api';
import Db from './Db';
import { Logger } from 'pino';
import pAll from 'p-all';

import { ClientFiltersFields, TGCommands } from './types';

import TorgiGovClient from './TorgiGovClient';

export default class TelegramClient {
  log: Logger;
  db: Db;
  bot: TelegramBot;
  torgiGovClient: TorgiGovClient;
  modifier: string | null;

  constructor({
    log,
    db,
    bot,
  }: {
    log: Logger;
    db: Db;
    bot: TelegramBot;
    torgiGovClient: TorgiGovClient;
  }) {
    this.log = log;
    this.db = db;
    this.bot = bot;
    this.torgiGovClient = this.torgiGovClient;
    this.modifier = null;
  }

  async init(): Promise<void> {
    const subjects = await this.torgiGovClient.getSubjects();
    const bidTypes = await this.torgiGovClient.getBidTypes();

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
          if (dbClient.isActive) {
            return;
          }

          await this.db.clientCollection.updateOne(
            { _id: dbClient._id },
            { $set: { isActive: true, updatedAt: new Date() } },
          );
        }

        await this.db.clientCollection.insertOne({
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

      if (text === TGCommands.INFO) {
        const dbClient = await this.db.clientCollection.findOne({
          telegramId: client.id,
        });

        if (!dbClient) {
          return;
        }

        const subjectRF = dbClient.filters.find(
          (filter) => filter.field === ClientFiltersFields.SUBJECT_RF,
        );

        const bidTypes = dbClient.filters.find(
          (filter) => filter.field === ClientFiltersFields.BID_TYPE,
        );

        const clientInfo =
          `Ваши фильтры:\n` +
          `${subjectRF && 'Регион: ' + subjectRF.value}\n` +
          `${
            bidTypes == null
              ? 'Выбраны все виды торгов'
              : 'Тип торгов: ' + bidTypes.value
          }`;

        await this.bot.sendMessage(client.id, clientInfo);
      }

      if (text === TGCommands.SET_REGION) {
        this.modifier = 'set_region';

        const keyboard = subjects.map((subject) => [{ text: subject }]);

        await this.bot.sendMessage(client.id, 'Выберите регион', {
          reply_markup: {
            keyboard,
            one_time_keyboard: true,
          },
        });
      }

      if (text === TGCommands.SET_NOTICE_TYPE) {
        this.modifier = 'set_notice_type';

        const keyboard = bidTypes.map((bidType) => [{ text: bidType }]);

        await this.bot.sendMessage(client.id, 'Выберите тип торгов', {
          reply_markup: {
            keyboard,
            one_time_keyboard: true,
          },
        });
      }

      if (text && this.modifier === 'set_region' && subjects.includes(text)) {
        await this.db.clientCollection.updateOne(
          { telegramId: client.id },
          {
            $set: {
              filters: [{ field: ClientFiltersFields.SUBJECT_RF, value: text }],
              updatedAt: new Date(),
            },
          },
        );

        const keyboard = [
          [{ text: 'Выбрать все' }],
          ...bidTypes.map((bidType) => [{ text: bidType }]),
        ];

        await this.bot.sendMessage(client.id, 'Выберите тип торгов', {
          reply_markup: {
            keyboard,
            one_time_keyboard: true,
          },
        });

        this.modifier = 'set_notice_type';
      }

      if (
        text &&
        this.modifier === 'set_notice_type' &&
        bidTypes.includes(text)
      ) {
        await this.db.clientCollection.updateOne(
          { telegramId: client.id },
          {
            $set: {
              updatedAt: new Date(),
            },
            $push: {
              filters: { field: ClientFiltersFields.BID_TYPE, value: text },
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
