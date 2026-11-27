import { pino } from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.LOG_LEVEL ?? (config.isProduction ? 'info' : 'debug'),
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  ...(!config.isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,req,res,responseTime',
      },
    },
  }),
});
