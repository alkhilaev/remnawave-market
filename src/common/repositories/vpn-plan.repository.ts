import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { VPNPlanEntity } from '@common/entities/vpn-plan.entity';

/**
 * Repository для работы с VPN тарифами
 * Инкапсулирует всю логику работы с БД
 */
@Injectable()
export class VPNPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создание нового тарифа
   */
  async create(data: Prisma.VPNPlanCreateInput): Promise<VPNPlanEntity> {
    const plan = await this.prisma.vPNPlan.create({ data });
    return new VPNPlanEntity(plan);
  }

  /**
   * Поиск тарифа по ID
   */
  async findById(id: string): Promise<VPNPlanEntity | null> {
    const plan = await this.prisma.vPNPlan.findUnique({ where: { id } });
    return plan ? new VPNPlanEntity(plan) : null;
  }

  /**
   * Поиск тарифа по ID с периодами и дополнениями
   */
  async findByIdWithDetails(id: string) {
    return this.prisma.vPNPlan.findUnique({
      where: { id },
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { durationDays: 'asc' },
        },
        extraTraffic: {
          where: { isActive: true },
          orderBy: { trafficGB: 'asc' },
        },
        extraBypassTraffic: {
          where: { isActive: true },
          orderBy: { bypassTrafficGB: 'asc' },
        },
        extraDevices: {
          where: { isActive: true },
          orderBy: { deviceCount: 'asc' },
        },
      },
    });
  }

  /**
   * Поиск тарифа по имени
   */
  async findByName(name: string): Promise<VPNPlanEntity | null> {
    const plan = await this.prisma.vPNPlan.findFirst({ where: { name } });
    return plan ? new VPNPlanEntity(plan) : null;
  }

  /**
   * Получение всех активных тарифов
   */
  async findAllActive(): Promise<VPNPlanEntity[]> {
    const plans = await this.prisma.vPNPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return plans.map((plan) => new VPNPlanEntity(plan));
  }

  /**
   * Получение всех тарифов или только активных
   */
  async findAll(onlyActive: boolean = true): Promise<VPNPlanEntity[]> {
    const plans = await this.prisma.vPNPlan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return plans.map((plan) => new VPNPlanEntity(plan));
  }

  /**
   * Получение всех активных тарифов с деталями
   */
  async findAllActiveWithDetails() {
    return this.prisma.vPNPlan.findMany({
      where: { isActive: true },
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { durationDays: 'asc' },
        },
        extraTraffic: {
          where: { isActive: true },
          orderBy: { trafficGB: 'asc' },
        },
        extraBypassTraffic: {
          where: { isActive: true },
          orderBy: { bypassTrafficGB: 'asc' },
        },
        extraDevices: {
          where: { isActive: true },
          orderBy: { deviceCount: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Обновление тарифа
   */
  async update(id: string, data: Prisma.VPNPlanUpdateInput): Promise<VPNPlanEntity> {
    const plan = await this.prisma.vPNPlan.update({
      where: { id },
      data,
    });
    return new VPNPlanEntity(plan);
  }

  /**
   * Деактивация тарифа
   */
  async deactivate(id: string): Promise<VPNPlanEntity> {
    const plan = await this.prisma.vPNPlan.update({
      where: { id },
      data: { isActive: false },
    });
    return new VPNPlanEntity(plan);
  }

  /**
   * Активация тарифа
   */
  async activate(id: string): Promise<VPNPlanEntity> {
    const plan = await this.prisma.vPNPlan.update({
      where: { id },
      data: { isActive: true },
    });
    return new VPNPlanEntity(plan);
  }

  /**
   * Удаление тарифа
   */
  async delete(id: string): Promise<void> {
    await this.prisma.vPNPlan.delete({ where: { id } });
  }

  /**
   * Подсчёт тарифов
   */
  async count(where?: Prisma.VPNPlanWhereInput): Promise<number> {
    return this.prisma.vPNPlan.count({ where });
  }
}
