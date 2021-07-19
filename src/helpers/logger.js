/* eslint-disable prettier/prettier */
import { transports, createLogger, format } from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
    format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${
          info.splat !== undefined ? `${info.splat}` : ' '
        }`
    )
  ),
  transports: [
    // new transports.Console({ colorize: true }),
    new transports.DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      filename: path.join(logDir, 'info-%DATE%.log'),
      dirname: `./${logDir}`,
      maxSize: '100m',
      maxFiles: '28',
      handleExceptions: true,
    }),
    new transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      filename: path.join(logDir, 'error-%DATE%.log'),
      dirname: `./${logDir}`,
      maxSize: '100m',
      maxFiles: '28',
      handleExceptions: true,
    }),
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorized: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
