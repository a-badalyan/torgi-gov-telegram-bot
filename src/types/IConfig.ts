export interface IConfig {
  environment: 'production' | 'stage';
  port: number;
  redisUri: string;
  mongoUri: string;
  logLevel: 'debug' | 'info' | 'error';
  torgiGovBaseUrl: string;
}
