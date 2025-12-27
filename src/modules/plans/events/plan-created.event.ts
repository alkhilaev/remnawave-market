/**
 * Событие создания тарифного плана
 */
export class PlanCreatedEvent {
  constructor(
    public readonly planId: string,
    public readonly name: string,
  ) {}
}
