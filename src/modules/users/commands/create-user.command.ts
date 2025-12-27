import { ICommand } from '@nestjs/cqrs';
import { Role } from '@prisma/client';

/**
 * Command для создания пользователя
 * CQRS Pattern - команды изменяют состояние
 */
export class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly role: Role = Role.USER,
  ) {}
}
