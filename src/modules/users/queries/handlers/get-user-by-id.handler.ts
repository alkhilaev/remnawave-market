import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { UserRepository } from '@common/repositories/user.repository';
import { UserEntity } from '@common/entities/user.entity';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

/**
 * Handler для запроса получения пользователя по ID
 * Query handlers только читают данные, не изменяют
 */
@Injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserEntity> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.code,
        ERRORS.USER_NOT_FOUND.httpCode,
      );
    }

    return user;
  }
}
