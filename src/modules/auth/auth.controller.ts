import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
} from '../../auth/dto';

@ApiTags('Авторизация')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description: 'Создаёт нового пользователя с ролью USER',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные',
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход пользователя',
    description: 'Авторизация пользователя по email и паролю',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные',
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный email или пароль',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление access токена',
    description: 'Получение нового access токена через refresh токен',
  })
  @ApiResponse({
    status: 200,
    description: 'Токен успешно обновлён',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные',
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный refresh токен',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Выход пользователя',
    description:
      'Выход из системы (в текущей реализации просто возвращает успешный статус, токены удаляются на клиенте)',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Успешный выход',
        },
      },
    },
  })
  async logout(): Promise<{ message: string }> {
    // В текущей реализации JWT токены stateless,
    // поэтому логаут происходит на клиенте путём удаления токенов
    return { message: 'Успешный выход' };
  }
}
