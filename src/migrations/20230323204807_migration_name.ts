import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> =>
  knex.schema
    .createTable('notices', (T) => {
      T.bigIncrements('id').primary();
      T.string('noticeNumber').notNullable().unique();
      T.string('bidType').notNullable();
      T.string('bidForm').notNullable();
      T.dateTime('publishedAt').notNullable();
      T.text('procedureName').notNullable();
      T.text('href').notNullable();
    })
    .createTable('regions', (T) => {
      T.integer('code').notNullable().primary();
      T.text('name').unique().notNullable();
    })
    .createTable('lots', (T) => {
      T.bigIncrements('id').notNullable().primary();
      T.foreign('noticeNumber').references('notices.noticeNumber');
      T.string('status').notNullable();
      T.text('name').notNullable();
      T.text('description').notNullable();
      T.string('priceMin').nullable();
      T.string('priceStep').nullable();
      T.string('deposit').nullable();
      T.string('currency').notNullable();
      T.foreign('regionCode').references('regions.code');
      T.text('estateAddress').notNullable();
    });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema
    .dropTableIfExists('notices')
    .dropTableIfExists('lots')
    .dropTableIfExists('regions');
