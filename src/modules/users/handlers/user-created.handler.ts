import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/user-created.event';

/**
 * Handler для события создания пользователя
 * Выполняется асинхронно после создания пользователя
 *
 * Здесь можно:
 * - Отправить welcome email
 * - Отправить уведомление в Telegram
 * - Залогировать событие в аналитику
 * - Создать дефолтные настройки
 */
@Injectable()
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  async handle(event: UserCreatedEvent) {
    this.logger.log(`Обработка события создания пользователя: ${event.userId}`);

    // TODO: Отправка welcome email
    if (event.email) {
      this.logger.log(`Отправка welcome email на ${event.email}`);
      // await this.emailService.sendWelcomeEmail(event.email);
    }

    // TODO: Отправка уведомления в Telegram
    // await this.telegramService.notifyAdmins(`Новый пользователь: ${event.userId}`);

    // TODO: Логирование в аналитику
    // await this.analyticsService.trackUserCreated(event.userId);

    this.logger.log(`Событие создания пользователя обработано: ${event.userId}`);
  }
}

/**
 * Альтернативный способ - через @OnEvent декоратор (NestJS Event Emitter)
 * Более гибкий, можно использовать wildcard patterns
 */
@Injectable()
export class UserCreatedEventListener {
  private readonly logger = new Logger(UserCreatedEventListener.name);

  @OnEvent('user.created')
  handleUserCreatedEvent(payload: { userId: string; email: string | null }) {
    this.logger.log(`[EventEmitter] Новый пользователь создан: ${payload.userId}`);

    // Асинхронная обработка
    // Не блокирует основной поток
  }

  @OnEvent('user.*')
  handleAllUserEvents(payload: any) {
    this.logger.log(`[EventEmitter] Событие пользователя:`, payload);
  }
}
