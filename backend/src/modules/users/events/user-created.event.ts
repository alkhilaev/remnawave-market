/**
 * Событие создания пользователя
 * Используется для асинхронной обработки (отправка email, логирование и т.д.)
 */
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string | null,
  ) {}
}
