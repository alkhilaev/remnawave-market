import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRepository } from '@common/repositories/user.repository';
import { CreateUserHandler } from './commands/handlers';
import { GetUserByIdHandler } from './queries/handlers';
import { UserCreatedHandler, UserCreatedEventListener } from './handlers';

// Все Command Handlers
const CommandHandlers = [CreateUserHandler];

// Все Query Handlers
const QueryHandlers = [GetUserByIdHandler];

// Все Event Handlers
const EventHandlers = [UserCreatedHandler, UserCreatedEventListener];

@Module({
  imports: [CqrsModule],
  providers: [UserRepository, ...CommandHandlers, ...QueryHandlers, ...EventHandlers],
  exports: [UserRepository],
})
export class UsersModule {}
