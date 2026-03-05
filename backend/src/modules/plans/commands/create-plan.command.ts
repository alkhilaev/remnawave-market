import { ICommand } from '@nestjs/cqrs';

/**
 * Command для создания нового тарифного плана
 */
export class CreatePlanCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly defaultTrafficLimitGB: number,
    public readonly defaultBypassTrafficLimitGB: number,
    public readonly defaultDeviceLimit: number,
    public readonly bypassTrafficEnabled: boolean = true,
  ) {}
}
