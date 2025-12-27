/**
 * Событие обновления тарифного плана
 */
export class PlanUpdatedEvent {
  constructor(
    public readonly planId: string,
    public readonly changes: Record<string, any>,
  ) {}
}
