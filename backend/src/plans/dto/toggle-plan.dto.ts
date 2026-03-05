import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class TogglePlanDto {
  @ApiProperty({
    description: 'Новое состояние тарифа (включен/выключен)',
    example: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  isActive: boolean;
}
