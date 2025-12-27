import { IQuery } from '@nestjs/cqrs';

/**
 * Query для получения тарифного плана по ID
 */
export class GetPlanByIdQuery implements IQuery {
  constructor(public readonly planId: string) {}
}
