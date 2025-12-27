import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { VPNPlanRepository } from '@common/repositories/vpn-plan.repository';
import { VPNPlanEntity } from '@common/entities/vpn-plan.entity';
import { CreatePlanCommand } from '../create-plan.command';
import { PlanCreatedEvent } from '../../events/plan-created.event';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

/**
 * Handler для создания тарифного плана
 * @Transactional автоматически создаёт транзакцию и откатывает при ошибке
 */
@Injectable()
@CommandHandler(CreatePlanCommand)
export class CreatePlanHandler implements ICommandHandler<CreatePlanCommand> {
  constructor(
    private readonly planRepository: VPNPlanRepository,
    private readonly eventBus: EventBus,
  ) {}

  @Transactional()
  async execute(command: CreatePlanCommand): Promise<VPNPlanEntity> {
    // Проверяем, не существует ли план с таким именем
    const existingPlan = await this.planRepository.findByName(command.name);
    if (existingPlan) {
      throw new HttpExceptionWithErrorCode(
        'Тарифный план с таким именем уже существует',
        'PLAN_ALREADY_EXISTS',
        400,
      );
    }

    // Создаём новый план
    const plan = await this.planRepository.create({
      name: command.name,
      description: command.description,
      defaultTrafficLimitGB: command.defaultTrafficLimitGB,
      defaultBypassTrafficLimitGB: command.defaultBypassTrafficLimitGB,
      defaultDeviceLimit: command.defaultDeviceLimit,
      bypassTrafficEnabled: command.bypassTrafficEnabled,
      isActive: true,
    });

    // Публикуем событие о создании плана
    this.eventBus.publish(new PlanCreatedEvent(plan.id, plan.name));

    return plan;
  }
}
