import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { PlanCreatedEvent } from '../events/plan-created.event';

/**
 * CQRS Event Handler для события создания плана
 */
@Injectable()
@EventsHandler(PlanCreatedEvent)
export class PlanCreatedHandler implements IEventHandler<PlanCreatedEvent> {
  private readonly logger = new Logger(PlanCreatedHandler.name);

  async handle(event: PlanCreatedEvent) {
    this.logger.log(`Создан новый тарифный план: ${event.name} (ID: ${event.planId})`);

    // TODO: Отправить уведомление администраторам о новом плане
    // TODO: Обновить кеш доступных планов
    // TODO: Логирование в аналитику
  }
}

/**
 * EventEmitter подход для события создания плана
 */
@Injectable()
export class PlanCreatedEventListener {
  private readonly logger = new Logger(PlanCreatedEventListener.name);

  @OnEvent('plan.created')
  handlePlanCreatedEvent(payload: { planId: string; name: string }) {
    this.logger.log(`EventEmitter: Создан план ${payload.name}`);
    // TODO: Дополнительная обработка
  }
}
