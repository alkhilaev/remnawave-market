import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';
import { JwtPayload } from '@common/decorators/get-jwt-payload.decorator';

/**
 * Guard для проверки ролей пользователя
 * Используется вместе с декоратором @Roles()
 *
 * @example
 * @Roles(UserRole.SUPER_ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin')
 * adminRoute() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userPayload = user as JwtPayload;

    if (!userPayload || !userPayload.role) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.FORBIDDEN_ROLE_ERROR.message,
        ERRORS.FORBIDDEN_ROLE_ERROR.code,
        ERRORS.FORBIDDEN_ROLE_ERROR.httpCode,
      );
    }

    const hasRole = requiredRoles.some((role) => userPayload.role === role);

    if (!hasRole) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.FORBIDDEN_ROLE_ERROR.message,
        ERRORS.FORBIDDEN_ROLE_ERROR.code,
        ERRORS.FORBIDDEN_ROLE_ERROR.httpCode,
      );
    }

    return true;
  }
}
