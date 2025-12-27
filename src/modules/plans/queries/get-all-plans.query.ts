import { IQuery } from '@nestjs/cqrs';

/**
 * Query для получения всех активных тарифных планов
 */
export class GetAllPlansQuery implements IQuery {
  constructor(public readonly onlyActive: boolean = true) {}
}
