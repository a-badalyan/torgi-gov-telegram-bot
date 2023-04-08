import * as env from 'env-var';

import { IConfig } from './types/IConfig';

const getConfig = (): IConfig => {
  try {
    const config = {
      environment: env
        .get('ENVIRONMENT')
        .required()
        .asEnum(['stage', 'production']),
      logLevel: env
        .get('LOG_LEVEL')
        .required()
        .asEnum(['debug', 'info', 'error']),
      port: env.get('PORT').required().default(3000).asPortNumber(),
      mongoUri: env.get('MONGO_URI').required().asUrlString(),
      telegramToken: env.get('TELEGRAM_TOKEN').required().asString(),
      databaseName: env.get('DATABASE_NAME').required().asString(),
      redisUri: env.get('REDIS_URI').required().asUrlString(),
      torgiGovBaseUrl: env
        .get('TORGI_GOV_BASE_URL')
        .default('https://torgi.gov.ru/')
        .required()
        .asUrlString(),
    };

    if (config === null) {
      console.error({ msg: 'misconfiguration', error_message: 'empty config' });
      process.exit(1);
    }

    return config;
  } catch (error: unknown) {
    const err = error as { message: string };
    console.error({ msg: 'misconfiguration', error_message: err.message });
    process.exit(1);
  }
};

const config = getConfig();

export default config;
