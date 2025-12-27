import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@common/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../auth/dto';
import { Role } from '@prisma/client';
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
    } catch (error) {
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
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
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
}
