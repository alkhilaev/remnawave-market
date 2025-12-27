import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto, TogglePlanDto } from '../../plans/dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новый тариф
   */
  async create(createPlanDto: CreatePlanDto) {
    const { periods, extraTraffic, extraBypassTraffic, extraDevices, ...planData } =
      createPlanDto;

    const plan = await this.prisma.vPNPlan.create({
      data: {
        ...planData,
        isActive: planData.isActive ?? true,
        periods: periods ? { create: periods } : undefined,
        extraTraffic: extraTraffic ? { create: extraTraffic } : undefined,
        extraBypassTraffic: extraBypassTraffic
          ? { create: extraBypassTraffic }
          : undefined,
        extraDevices: extraDevices ? { create: extraDevices } : undefined,
      },
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });

    return plan;
  }

  /**
   * Получить все тарифы (админ видит все, пользователи только активные)
   */
  async findAll(showInactive: boolean = false) {
    return this.prisma.vPNPlan.findMany({
      where: showInactive ? {} : { isActive: true },
      include: {
        periods: { where: showInactive ? {} : { isActive: true } },
        extraTraffic: { where: showInactive ? {} : { isActive: true } },
        extraBypassTraffic: { where: showInactive ? {} : { isActive: true } },
        extraDevices: { where: showInactive ? {} : { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получить тариф по ID
   */
  async findOne(id: string, showInactive: boolean = false) {
    const plan = await this.prisma.vPNPlan.findUnique({
      where: { id },
      include: {
        periods: { where: showInactive ? {} : { isActive: true } },
        extraTraffic: { where: showInactive ? {} : { isActive: true } },
        extraBypassTraffic: { where: showInactive ? {} : { isActive: true } },
        extraDevices: { where: showInactive ? {} : { isActive: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Тариф с ID ${id} не найден`);
    }

    return plan;
  }

  /**
   * Обновить тариф
   */
  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id, true); // Проверка существования

    const { periods, extraTraffic, extraBypassTraffic, extraDevices, ...planData } =
      updatePlanDto;

    return this.prisma.vPNPlan.update({
      where: { id },
      data: planData,
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });
  }

  /**
   * Удалить тариф
   */
  async remove(id: string) {
    await this.findOne(id, true);

    // Проверяем есть ли активные подписки
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { planId: id, status: 'ACTIVE' },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        `Невозможно удалить тариф: есть ${activeSubscriptions} активных подписок`,
      );
    }

    await this.prisma.vPNPlan.delete({ where: { id } });
    return { message: 'Тариф успешно удалён' };
  }

  /**
   * Включить/выключить тариф
   */
  async togglePlan(id: string, toggleDto: TogglePlanDto) {
    await this.findOne(id, true);

    // Если выключаем, проверяем что это не последний активный тариф
    if (!toggleDto.isActive) {
      const activePlansCount = await this.prisma.vPNPlan.count({
        where: { isActive: true },
      });

      if (activePlansCount <= 1) {
        throw new BadRequestException(
          'Невозможно выключить последний активный тариф',
        );
      }
    }

    return this.prisma.vPNPlan.update({
      where: { id },
      data: { isActive: toggleDto.isActive },
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });
  }

  /**
   * Добавить период к тарифу
   */
  async addPeriod(planId: string, periodData: { durationDays: number; price: number; isActive?: boolean }) {
    await this.findOne(planId, true);

    // Проверка на дублирование
    const existing = await this.prisma.planPeriod.findUnique({
      where: {
        planId_durationDays: {
          planId,
          durationDays: periodData.durationDays,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Период ${periodData.durationDays} дней уже существует для этого тарифа`,
      );
    }

    return this.prisma.planPeriod.create({
      data: {
        ...periodData,
        planId,
        isActive: periodData.isActive ?? true,
      },
    });
  }

  /**
   * Включить/выключить период
   */
  async togglePeriod(planId: string, periodId: string, isActive: boolean) {
    const period = await this.prisma.planPeriod.findFirst({
      where: { id: periodId, planId },
    });

    if (!period) {
      throw new NotFoundException('Период не найден');
    }

    return this.prisma.planPeriod.update({
      where: { id: periodId },
      data: { isActive },
    });
  }

  /**
   * Удалить период
   */
  async removePeriod(planId: string, periodId: string) {
    const period = await this.prisma.planPeriod.findFirst({
      where: { id: periodId, planId },
    });

    if (!period) {
      throw new NotFoundException('Период не найден');
    }

    await this.prisma.planPeriod.delete({ where: { id: periodId } });
    return { message: 'Период удалён' };
  }

  // Аналогичные методы для extraTraffic, extraBypassTraffic, extraDevices
  // Опускаю для краткости, но логика идентична
}
