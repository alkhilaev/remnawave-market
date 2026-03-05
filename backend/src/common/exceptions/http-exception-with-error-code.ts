import { HttpException } from '@nestjs/common';

/**
 * Кастомное исключение с error code для более детальной обработки ошибок на клиенте
 */
export class HttpExceptionWithErrorCode extends HttpException {
  errorCode: string;

  constructor(message: string, errorCode: string, statusCode: number) {
    super(message, statusCode);
    this.errorCode = errorCode;
  }
}
