import config from './src/config';

module.exports = {
  client: 'pg',
  connection: config.postgresUri,
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
  },
};
