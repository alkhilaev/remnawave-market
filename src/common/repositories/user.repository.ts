import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { UserEntity } from '@common/entities/user.entity';

/**
 * Repository для работы с пользователями
 * Инкапсулирует всю логику работы с БД
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Конвертирует Prisma User в UserEntity
   */
  private toEntity(user: any): UserEntity {
    return new UserEntity({
      ...user,
      balance: Number(user.balance),
    });
  }

  /**
   * Создание нового пользователя
   */
  async create(data: Prisma.UserCreateInput): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data });
    return this.toEntity(user);
  }

  /**
   * Поиск пользователя по ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  /**
   * Поиск пользователя по email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  /**
   * Поиск пользователя по Telegram ID
   */
  async findByTelegramId(telegramId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    return user ? this.toEntity(user) : null;
  }

  /**
   * Поиск первого пользователя по роли
   */
  async findFirstByRole(role: Role): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({ where: { role } });
    return user ? this.toEntity(user) : null;
  }

  /**
   * Обновление пользователя
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toEntity(user);
  }

  /**
   * Обновление баланса пользователя
   */
  async updateBalance(id: string, amount: number): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
    return this.toEntity(user);
  }

  /**
   * Обновление refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  /**
   * Верификация email
   */
  async verifyEmail(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });
    return this.toEntity(user);
  }

  /**
   * Удаление пользователя
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * Подсчёт пользователей
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  /**
   * Получение всех пользователей с пагинацией
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany(params);
    return users.map((user) => this.toEntity(user));
  }
}
