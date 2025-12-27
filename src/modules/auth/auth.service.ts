import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../auth/dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = registerDto;

    // Проверяем существование пользователя
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
        balance: 0,
      },
    });

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
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
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
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
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Генерируем новые токены
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          balance: Number(user.balance),
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Невалидный refresh токен');
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      ...user,
      balance: Number(user.balance),
    };
  }
}
