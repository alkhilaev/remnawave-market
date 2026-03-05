import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { VPNPlanRepository } from '@common/repositories/vpn-plan.repository';
import { VPNPlanEntity } from '@common/entities/vpn-plan.entity';
import { UpdatePlanCommand } from '../update-plan.command';
import { PlanUpdatedEvent } from '../../events/plan-updated.event';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

/**
 * Handler для обновления тарифного плана
 */
@Injectable()
@CommandHandler(UpdatePlanCommand)
export class UpdatePlanHandler implements ICommandHandler<UpdatePlanCommand> {
  constructor(
    private readonly planRepository: VPNPlanRepository,
    private readonly eventBus: EventBus,
  ) {}

  @Transactional()
  async execute(command: UpdatePlanCommand): Promise<VPNPlanEntity> {
    // Проверяем существование плана
    const existingPlan = await this.planRepository.findById(command.planId);
    if (!existingPlan) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.PLAN_NOT_FOUND.message,
        ERRORS.PLAN_NOT_FOUND.code,
        ERRORS.PLAN_NOT_FOUND.httpCode,
      );
    }

    // Обновляем план
    const plan = await this.planRepository.update(command.planId, command.data);

    // Публикуем событие об обновлении плана
    this.eventBus.publish(new PlanUpdatedEvent(plan.id, command.data));

    return plan;
  }
}
