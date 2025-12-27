import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class ToggleOptionDto {
  @ApiProperty({
    description: 'ID опции для переключения',
    example: 'uuid-here',
  })
  @IsString({ message: 'ID должен быть строкой' })
  @IsNotEmpty({ message: 'ID обязателен' })
  optionId: string;

  @ApiProperty({
    description: 'Новое состояние опции (включена/выключена)',
    example: true,
  })
  @IsBoolean({ message: 'isActive должен быть boolean' })
  isActive: boolean;
}
