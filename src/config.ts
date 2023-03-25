import * as env from 'env-var';

import { IConfig } from './types/IConfig';

const getConfig = (): IConfig => {
  try {
    const config = {
      environment: env
        .get('ENVIRONMENT')
        .required()
        .default('stage')
        .asEnum(['stage', 'production']),
      logLevel: env
        .get('LOG_LEVEL')
        .required()
        .default('debug')
        .asEnum(['debug', 'info', 'error']),
      port: env.get('PORT').required().default(3000).asPortNumber(),
      postgresUri: env
        .get('POSTGRES_URI')
        .default('http://bad-url')
        .required()
        .asUrlString(),
      redisUri: env
        .get('REDIS_URI')
        .default('http://bad-url')
        .required()
        .asUrlString(),
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
