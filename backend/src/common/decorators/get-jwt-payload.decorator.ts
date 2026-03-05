import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Интерфейс JWT payload
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Декоратор для получения JWT payload из request.user
 * Требует использования JwtAuthGuard
 *
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@GetJwtPayload() payload: JwtPayload) {
 *   return { userId: payload.sub };
 * }
 */
export const GetJwtPayload = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
