import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Кастомный формат для логов
const customFormat = printf(({ level, message, timestamp, stack, context }) => {
  const contextStr = context ? `[${context}]` : '';
  const messageStr = stack || message;
  return `${timestamp} ${level} ${contextStr} ${messageStr}`;
});

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
    }),
  ],
};
