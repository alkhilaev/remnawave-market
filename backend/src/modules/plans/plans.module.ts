import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { VPNPlanRepository } from '@common/repositories/vpn-plan.repository';
import { CreatePlanHandler, UpdatePlanHandler } from './commands/handlers';
import { GetPlanByIdHandler, GetAllPlansHandler } from './queries/handlers';
import {
  PlanCreatedHandler,
  PlanCreatedEventListener,
  PlanUpdatedHandler,
  PlanUpdatedEventListener,
} from './handlers';

// Все Command Handlers
const CommandHandlers = [CreatePlanHandler, UpdatePlanHandler];

// Все Query Handlers
const QueryHandlers = [GetPlanByIdHandler, GetAllPlansHandler];

// Все Event Handlers
const EventHandlers = [
  PlanCreatedHandler,
  PlanCreatedEventListener,
  PlanUpdatedHandler,
  PlanUpdatedEventListener,
];

@Module({
  imports: [CqrsModule],
  controllers: [PlansController],
  providers: [
    PlansService,
    VPNPlanRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [PlansService, VPNPlanRepository],
})
export class PlansModule {}
