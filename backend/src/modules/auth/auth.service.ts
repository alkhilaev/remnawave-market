import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserRepository } from '@common/repositories/user.repository';
import bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto, TelegramAuthDto } from '../../auth/dto';
import { Role } from '@/generated/prisma/client';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = registerDto;

    // Проверяем существование пользователя
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.USER_ALREADY_EXISTS.message,
        ERRORS.USER_ALREADY_EXISTS.code,
        ERRORS.USER_ALREADY_EXISTS.httpCode,
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      role: Role.USER,
      balance: 0,
    });

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email!, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email!,
        role: user.role,
        balance: Number(user.balance),
      },
    };
  }

  /**
   * Вход пользователя
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Находим пользователя
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.INVALID_CREDENTIALS.message,
        ERRORS.INVALID_CREDENTIALS.code,
        ERRORS.INVALID_CREDENTIALS.httpCode,
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.INVALID_CREDENTIALS.message,
        ERRORS.INVALID_CREDENTIALS.code,
        ERRORS.INVALID_CREDENTIALS.httpCode,
      );
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email!, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email!,
        role: user.role,
        balance: Number(user.balance),
      },
    };
  }

  /**
   * Обновление access токена через refresh токен
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Верифицируем refresh токен
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Находим пользователя
      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new HttpExceptionWithErrorCode(
          ERRORS.USER_NOT_FOUND.message,
          ERRORS.USER_NOT_FOUND.code,
          ERRORS.USER_NOT_FOUND.httpCode,
        );
      }

      // Генерируем новые токены
      const tokens = await this.generateTokens(user.id, user.email!, user.role);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email!,
          role: user.role,
          balance: Number(user.balance),
        },
      };
    } catch {
      throw new HttpExceptionWithErrorCode(
        ERRORS.INVALID_REFRESH_TOKEN.message,
        ERRORS.INVALID_REFRESH_TOKEN.code,
        ERRORS.INVALID_REFRESH_TOKEN.httpCode,
      );
    }
  }

  /**
   * Генерация access и refresh токенов
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Telegram авторизация
   */
  async telegramAuth(telegramAuthDto: TelegramAuthDto): Promise<AuthResponseDto> {
    const { telegramId, telegramUsername, telegramFirstName, telegramLastName } = telegramAuthDto;

    // Проверяем является ли пользователь админом по TELEGRAM_ADMIN_IDS
    const adminIds = this.configService.get<string>('TELEGRAM_ADMIN_IDS') || '';
    const adminList = adminIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    const shouldBeAdmin = adminList.includes(telegramId);

    // Ищем пользователя по Telegram ID
    let user = await this.userRepository.findByTelegramId(telegramId);

    if (!user) {
      // Создаём нового пользователя
      user = await this.userRepository.create({
        telegramId,
        telegramUsername,
        telegramFirstName,
        telegramLastName,
        role: shouldBeAdmin ? Role.ADMIN : Role.USER,
        balance: 0,
      });
    } else {
      // Обновляем данные пользователя (включая роль если нужно)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        telegramUsername,
        telegramFirstName,
        telegramLastName,
      };

      // Обновляем роль если пользователя добавили/удалили из админов
      // Но не трогаем SUPER_ADMIN
      if (user.role !== Role.SUPER_ADMIN) {
        if (shouldBeAdmin && user.role !== Role.ADMIN) {
          updateData.role = Role.ADMIN;
        } else if (!shouldBeAdmin && user.role === Role.ADMIN) {
          updateData.role = Role.USER;
        }
      }

      user = await this.userRepository.update(user.id, updateData);
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email || user.telegramId!, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email || user.telegramId!,
        role: user.role,
        balance: Number(user.balance),
      },
    };
  }

  /**
   * Валидация пользователя по ID (для JWT стратегии)
   */
  async validateUser(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.code,
        ERRORS.USER_NOT_FOUND.httpCode,
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      balance: Number(user.balance),
    };
  }

  setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
    const apiPrefix = this.configService.get('API_PREFIX') || 'api/v1';
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const accessMaxAge = this.parseExpiration(
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    );
    const refreshMaxAge = this.parseExpiration(
      this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    );

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: `/${apiPrefix}`,
      maxAge: accessMaxAge,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: `/${apiPrefix}/auth/refresh`,
      maxAge: refreshMaxAge,
    });
  }

  clearTokenCookies(res: Response): void {
    const apiPrefix = this.configService.get('API_PREFIX') || 'api/v1';

    res.clearCookie('access_token', { path: `/${apiPrefix}` });
    res.clearCookie('refresh_token', { path: `/${apiPrefix}/auth/refresh` });
  }

  private parseExpiration(str: string): number {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 15 * 60 * 1000; // fallback 15m
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }
}
