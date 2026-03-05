import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, TelegramAuthDto } from '../../auth/dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

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
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    this.authService.setTokenCookies(res, result);
    return { user: result.user };
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
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    this.authService.setTokenCookies(res, result);
    return { user: result.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение текущего пользователя',
    description: 'Возвращает актуальные данные авторизованного пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный или просроченный токен',
  })
  async me(@CurrentUser() user: CurrentUserData) {
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление access токена',
    description: 'Получение нового access токена через refresh токен из cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Токен успешно обновлён',
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный refresh токен',
  })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.INVALID_REFRESH_TOKEN.message,
        ERRORS.INVALID_REFRESH_TOKEN.code,
        ERRORS.INVALID_REFRESH_TOKEN.httpCode,
      );
    }
    const result = await this.authService.refreshTokens(refreshToken);
    this.authService.setTokenCookies(res, result);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Выход пользователя',
    description: 'Выход из системы — очистка httpOnly cookies с токенами',
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
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    this.authService.clearTokenCookies(res);
    return { message: 'Успешный выход' };
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Telegram авторизация',
    description:
      'Авторизация пользователя через Telegram. Создаёт пользователя если не существует.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные',
  })
  async telegramAuth(
    @Body() telegramAuthDto: TelegramAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.telegramAuth(telegramAuthDto);
    this.authService.setTokenCookies(res, result);
    return { user: result.user };
  }
}
