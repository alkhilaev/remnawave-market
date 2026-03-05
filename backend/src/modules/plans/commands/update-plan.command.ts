import { ICommand } from '@nestjs/cqrs';

/**
 * Command для обновления тарифного плана
 */
export class UpdatePlanCommand implements ICommand {
  constructor(
    public readonly planId: string,
    public readonly data: {
      name?: string;
      description?: string | null;
      price?: number;
      durationDays?: number;
      trafficLimitGb?: number | null;
      isActive?: boolean;
    },
  ) {}
}
