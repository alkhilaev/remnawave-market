import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TelegramAuthDto {
  @ApiProperty({
    description: 'Telegram ID пользователя',
    example: '1212804237',
  })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({
    description: 'Telegram username',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  telegramUsername?: string;

  @ApiProperty({
    description: 'Имя пользователя в Telegram',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  telegramFirstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя в Telegram',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  telegramLastName?: string;
}
