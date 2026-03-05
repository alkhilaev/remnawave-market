import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO для создания периода
export class CreatePlanPeriodDto {
  @ApiProperty({
    description: 'Длительность в днях',
    example: 30,
  })
  @IsInt({ message: 'Длительность должна быть целым числом' })
  @Min(1, { message: 'Длительность должна быть минимум 1 день' })
  durationDays: number;

  @ApiProperty({
    description: 'Цена за период (в рублях)',
    example: 199,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @ApiProperty({
    description: 'Активен ли период',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  @IsOptional()
  isActive?: boolean;
}

// DTO для дополнительного трафика
export class CreatePlanExtraTrafficDto {
  @ApiProperty({
    description: 'Количество GB трафика',
    example: 2000,
  })
  @IsInt({ message: 'Трафик должен быть целым числом' })
  @Min(1, { message: 'Трафик должен быть минимум 1 GB' })
  trafficGB: number;

  @ApiProperty({
    description: 'Цена за дополнительный трафик (в рублях)',
    example: 200,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @ApiProperty({
    description: 'Активна ли опция',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  @IsOptional()
  isActive?: boolean;
}

// DTO для дополнительного bypass трафика
export class CreatePlanExtraBypassTrafficDto {
  @ApiProperty({
    description: 'Количество GB bypass трафика',
    example: 100,
  })
  @IsInt({ message: 'Bypass трафик должен быть целым числом' })
  @Min(1, { message: 'Bypass трафик должен быть минимум 1 GB' })
  bypassTrafficGB: number;

  @ApiProperty({
    description: 'Цена за дополнительный bypass трафик (в рублях)',
    example: 100,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @ApiProperty({
    description: 'Активна ли опция',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  @IsOptional()
  isActive?: boolean;
}

// DTO для дополнительных устройств
export class CreatePlanExtraDeviceDto {
  @ApiProperty({
    description: 'Количество устройств',
    example: 4,
  })
  @IsInt({ message: 'Количество устройств должно быть целым числом' })
  @Min(1, { message: 'Количество устройств должно быть минимум 1' })
  deviceCount: number;

  @ApiProperty({
    description: 'Цена за дополнительные устройства (в рублях)',
    example: 100,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @ApiProperty({
    description: 'Активна ли опция',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  @IsOptional()
  isActive?: boolean;
}

// Основной DTO для создания тарифа
export class CreatePlanDto {
  @ApiProperty({
    description: 'Название тарифа',
    example: 'Стандарт',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  name: string;

  @ApiProperty({
    description: 'Описание тарифа',
    example: 'Стандартный тарифный план с гибкими опциями',
    required: false,
  })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Лимит трафика по умолчанию в GB (0 = безлимит)',
    example: 1000,
  })
  @IsInt({ message: 'Лимит трафика должен быть целым числом' })
  @Min(0, { message: 'Лимит трафика не может быть отрицательным' })
  defaultTrafficLimitGB: number;

  @ApiProperty({
    description: 'Лимит bypass трафика по умолчанию в GB',
    example: 50,
  })
  @IsInt({ message: 'Лимит bypass трафика должен быть целым числом' })
  @Min(0, { message: 'Лимит bypass трафика не может быть отрицательным' })
  defaultBypassTrafficLimitGB: number;

  @ApiProperty({
    description: 'Количество устройств по умолчанию',
    example: 2,
  })
  @IsInt({ message: 'Количество устройств должно быть целым числом' })
  @Min(1, { message: 'Количество устройств должно быть минимум 1' })
  defaultDeviceLimit: number;

  @ApiProperty({
    description: 'Периоды подписки',
    type: [CreatePlanPeriodDto],
    required: false,
  })
  @IsArray({ message: 'Периоды должны быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanPeriodDto)
  @IsOptional()
  periods?: CreatePlanPeriodDto[];

  @ApiProperty({
    description: 'Дополнительный трафик',
    type: [CreatePlanExtraTrafficDto],
    required: false,
  })
  @IsArray({ message: 'Дополнительный трафик должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanExtraTrafficDto)
  @IsOptional()
  extraTraffic?: CreatePlanExtraTrafficDto[];

  @ApiProperty({
    description: 'Дополнительный bypass трафик',
    type: [CreatePlanExtraBypassTrafficDto],
    required: false,
  })
  @IsArray({ message: 'Дополнительный bypass трафик должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanExtraBypassTrafficDto)
  @IsOptional()
  extraBypassTraffic?: CreatePlanExtraBypassTrafficDto[];

  @ApiProperty({
    description: 'Дополнительные устройства',
    type: [CreatePlanExtraDeviceDto],
    required: false,
  })
  @IsArray({ message: 'Дополнительные устройства должны быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanExtraDeviceDto)
  @IsOptional()
  extraDevices?: CreatePlanExtraDeviceDto[];

  @ApiProperty({
    description: 'Активен ли тариф',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  @IsOptional()
  isActive?: boolean;
}
