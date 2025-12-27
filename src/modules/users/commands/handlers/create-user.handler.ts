import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from '../create-user.command';
import { UserRepository } from '@common/repositories/user.repository';
import { UserEntity } from '@common/entities/user.entity';
import { UserCreatedEvent } from '../../events/user-created.event';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

/**
 * Handler для команды создания пользователя
 * Использует @Transactional() для автоматического управления транзакциями
 */
@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  @Transactional()
  async execute(command: CreateUserCommand): Promise<UserEntity> {
    // Проверка существования пользователя
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.USER_ALREADY_EXISTS.message,
        ERRORS.USER_ALREADY_EXISTS.code,
        ERRORS.USER_ALREADY_EXISTS.httpCode,
      );
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(command.password, 10);

    // Создание пользователя
    const user = await this.userRepository.create({
      email: command.email,
      password: hashedPassword,
      role: command.role,
      balance: 0,
    });

    // Публикация события (асинхронно обработается EventHandler)
    this.eventBus.publish(new UserCreatedEvent(user.id, user.email));

    return user;
  }
}
