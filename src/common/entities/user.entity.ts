import { Role } from '@prisma/client';

/**
 * User Entity для работы с бизнес-логикой
 */
export class UserEntity {
  id: string;
  email: string | null;
  password: string | null;
  role: Role;
  balance: number;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  telegramId: string | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramLastName: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  /**
   * Проверка является ли пользователь администратором
   */
  isAdmin(): boolean {
    return this.role === Role.ADMIN || this.role === Role.SUPER_ADMIN;
  }

  /**
   * Проверка является ли пользователь супер-администратором
   */
  isSuperAdmin(): boolean {
    return this.role === Role.SUPER_ADMIN;
  }

  /**
   * Проверка верифицирован ли email
   */
  isVerified(): boolean {
    return this.isEmailVerified;
  }

  /**
   * Получение display name пользователя
   */
  getDisplayName(): string {
    if (this.email) return this.email;
    if (this.telegramUsername) return `@${this.telegramUsername}`;
    if (this.telegramFirstName) {
      return this.telegramLastName
        ? `${this.telegramFirstName} ${this.telegramLastName}`
        : this.telegramFirstName;
    }
    return 'Пользователь';
  }
}
