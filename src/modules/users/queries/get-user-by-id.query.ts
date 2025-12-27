import { IQuery } from '@nestjs/cqrs';

/**
 * Query для получения пользователя по ID
 * CQRS Pattern - запросы только читают данные
 */
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
