import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { PlanUpdatedEvent } from '../events/plan-updated.event';

/**
 * CQRS Event Handler для события обновления плана
 */
@Injectable()
@EventsHandler(PlanUpdatedEvent)
export class PlanUpdatedHandler implements IEventHandler<PlanUpdatedEvent> {
  private readonly logger = new Logger(PlanUpdatedHandler.name);

  async handle(event: PlanUpdatedEvent) {
    this.logger.log(`Обновлён тарифный план ID: ${event.planId}`, event.changes);

    // TODO: Отправить уведомление пользователям с этим планом
    // TODO: Обновить кеш планов
    // TODO: Логирование изменений в аудит
  }
}

/**
 * EventEmitter подход для события обновления плана
 */
@Injectable()
export class PlanUpdatedEventListener {
  private readonly logger = new Logger(PlanUpdatedEventListener.name);

  @OnEvent('plan.updated')
  handlePlanUpdatedEvent(payload: { planId: string; changes: Record<string, any> }) {
    this.logger.log(`EventEmitter: Обновлён план ${payload.planId}`);
    // TODO: Дополнительная обработка
  }
}
