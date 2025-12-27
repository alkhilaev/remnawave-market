import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access токен (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Информация о пользователе',
  })
  user: {
    id: string;
    email: string;
    role: Role;
    balance: number;
  };
}
