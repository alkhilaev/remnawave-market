import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для проверки ролей пользователя
 * Используется вместе с RolesGuard
 *
 * @example
 * @Roles(Role.SUPER_ADMIN)
 * @Get('admin-only')
 * adminOnlyRoute() {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
