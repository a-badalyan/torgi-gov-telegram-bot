export interface IConfig {
  environment: 'production' | 'stage';
  port: number;
  postgresUri: string;
  redisUri: string;
  logLevel: 'debug' | 'info' | 'error';
  torgiGovBaseUrl: string;
}
