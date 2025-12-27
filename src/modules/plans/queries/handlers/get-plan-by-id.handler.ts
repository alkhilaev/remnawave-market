import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { VPNPlanRepository } from '@common/repositories/vpn-plan.repository';
import { VPNPlanEntity } from '@common/entities/vpn-plan.entity';
import { GetPlanByIdQuery } from '../get-plan-by-id.query';
import { HttpExceptionWithErrorCode } from '@common/exceptions/http-exception-with-error-code';
import { ERRORS } from '@common/constants/errors';

/**
 * Handler для получения плана по ID
 * Query handlers только читают данные, не изменяют
 */
@Injectable()
@QueryHandler(GetPlanByIdQuery)
export class GetPlanByIdHandler implements IQueryHandler<GetPlanByIdQuery> {
  constructor(private readonly planRepository: VPNPlanRepository) {}

  async execute(query: GetPlanByIdQuery): Promise<VPNPlanEntity> {
    const plan = await this.planRepository.findById(query.planId);

    if (!plan) {
      throw new HttpExceptionWithErrorCode(
        ERRORS.PLAN_NOT_FOUND.message,
        ERRORS.PLAN_NOT_FOUND.code,
        ERRORS.PLAN_NOT_FOUND.httpCode,
      );
    }

    return plan;
  }
}
