import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { VPNPlanRepository } from '@common/repositories/vpn-plan.repository';
import { VPNPlanEntity } from '@common/entities/vpn-plan.entity';
import { GetAllPlansQuery } from '../get-all-plans.query';

/**
 * Handler для получения всех планов
 */
@Injectable()
@QueryHandler(GetAllPlansQuery)
export class GetAllPlansHandler implements IQueryHandler<GetAllPlansQuery> {
  constructor(private readonly planRepository: VPNPlanRepository) {}

  async execute(query: GetAllPlansQuery): Promise<VPNPlanEntity[]> {
    return this.planRepository.findAll(query.onlyActive);
  }
}
