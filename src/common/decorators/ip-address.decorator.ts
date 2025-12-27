import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Декоратор для получения IP адреса клиента
 * Учитывает заголовки прокси (x-forwarded-for, x-real-ip)
 */
export const IpAddress = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // Проверяем заголовки прокси
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback на стандартное поле
  return request.ip || request.socket.remoteAddress || 'unknown';
});
