import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto, TogglePlanDto } from '../../plans/dto';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Создать новый тариф
   * Инвалидирует кэш после создания
   */
  async create(createPlanDto: CreatePlanDto) {
    const { periods, extraTraffic, extraBypassTraffic, extraDevices, ...planData } = createPlanDto;

    const plan = await this.prisma.vPNPlan.create({
      data: {
        ...planData,
        isActive: planData.isActive ?? true,
        periods: periods ? { create: periods } : undefined,
        extraTraffic: extraTraffic ? { create: extraTraffic } : undefined,
        extraBypassTraffic: extraBypassTraffic ? { create: extraBypassTraffic } : undefined,
        extraDevices: extraDevices ? { create: extraDevices } : undefined,
      },
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });

    // Инвалидируем кэш списка тарифов
    await this.invalidatePlansCache();

    return plan;
  }

  /**
   * Инвалидация кэша тарифов
   */
  private async invalidatePlansCache() {
    await this.cacheManager.del('plans:all:active-only');
    await this.cacheManager.del('plans:all:with-inactive');
  }

  /**
   * Инвалидация кэша конкретного тарифа
   */
  private async invalidatePlanCache(planId: string) {
    await this.cacheManager.del(`plan:${planId}:active-only`);
    await this.cacheManager.del(`plan:${planId}:with-inactive`);
  }

  /**
   * Получить все тарифы (админ видит все, пользователи только активные)
   * Использует Redis кэш для активных тарифов
   */
  async findAll(showInactive: boolean = false) {
    const cacheKey = `plans:all:${showInactive ? 'with-inactive' : 'active-only'}`;

    // Пытаемся получить из кэша
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Если нет в кэше - запрашиваем из БД
    const plans = await this.prisma.vPNPlan.findMany({
      where: showInactive ? {} : { isActive: true },
      include: {
        periods: {
          where: showInactive ? {} : { isActive: true },
          orderBy: { durationDays: 'asc' },
        },
        extraTraffic: { where: showInactive ? {} : { isActive: true } },
        extraBypassTraffic: { where: showInactive ? {} : { isActive: true } },
        extraDevices: { where: showInactive ? {} : { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Сохраняем в кэш
    await this.cacheManager.set(cacheKey, plans, 300000); // 5 минут

    return plans;
  }

  /**
   * Получить тариф по ID
   * Использует Redis кэш
   */
  async findOne(id: string, showInactive: boolean = false) {
    const cacheKey = `plan:${id}:${showInactive ? 'with-inactive' : 'active-only'}`;

    // Пытаемся получить из кэша
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const plan = await this.prisma.vPNPlan.findUnique({
      where: { id },
      include: {
        periods: {
          where: showInactive ? {} : { isActive: true },
          orderBy: { durationDays: 'asc' },
        },
        extraTraffic: { where: showInactive ? {} : { isActive: true } },
        extraBypassTraffic: { where: showInactive ? {} : { isActive: true } },
        extraDevices: { where: showInactive ? {} : { isActive: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Тариф с ID ${id} не найден`);
    }

    // Сохраняем в кэш
    await this.cacheManager.set(cacheKey, plan, 300000); // 5 минут

    return plan;
  }

  /**
   * Обновить тариф
   * Инвалидирует кэш после обновления
   */
  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id, true); // Проверка существования

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { periods, extraTraffic, extraBypassTraffic, extraDevices, ...planData } = updatePlanDto;

    const updated = await this.prisma.vPNPlan.update({
      where: { id },
      data: planData,
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });

    // Инвалидируем кэш
    await this.invalidatePlansCache();
    await this.invalidatePlanCache(id);

    return updated;
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
   * Инвалидирует кэш после изменения
   */
  async togglePlan(id: string, toggleDto: TogglePlanDto) {
    await this.findOne(id, true);

    // Если выключаем, проверяем что это не последний активный тариф
    if (!toggleDto.isActive) {
      const activePlansCount = await this.prisma.vPNPlan.count({
        where: { isActive: true },
      });

      if (activePlansCount <= 1) {
        throw new BadRequestException('Невозможно выключить последний активный тариф');
      }
    }

    const updated = await this.prisma.vPNPlan.update({
      where: { id },
      data: { isActive: toggleDto.isActive },
      include: {
        periods: true,
        extraTraffic: true,
        extraBypassTraffic: true,
        extraDevices: true,
      },
    });

    // Инвалидируем кэш
    await this.invalidatePlansCache();
    await this.invalidatePlanCache(id);

    return updated;
  }

  /**
   * Добавить период к тарифу
   */
  async addPeriod(
    planId: string,
    periodData: { durationDays: number; price: number; isActive?: boolean },
  ) {
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

    const created = await this.prisma.planPeriod.create({
      data: {
        ...periodData,
        planId,
        isActive: periodData.isActive ?? true,
      },
    });

    // Инвалидируем кэш
    await this.invalidatePlanCache(planId);

    return created;
  }

  /**
   * Обновить период
   */
  async updatePeriod(
    planId: string,
    periodId: string,
    periodData: { durationDays?: number; price?: number },
  ) {
    const period = await this.prisma.planPeriod.findFirst({
      where: { id: periodId, planId },
    });

    if (!period) {
      throw new NotFoundException('Период не найден');
    }

    // Если меняется длительность, проверяем на дублирование
    if (periodData.durationDays && periodData.durationDays !== period.durationDays) {
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
    }

    const updated = await this.prisma.planPeriod.update({
      where: { id: periodId },
      data: periodData,
    });

    // Инвалидируем кэш
    await this.invalidatePlanCache(planId);

    return updated;
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

    const updated = await this.prisma.planPeriod.update({
      where: { id: periodId },
      data: { isActive },
    });

    // Инвалидируем кэш
    await this.invalidatePlanCache(planId);

    return updated;
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

    // Инвалидируем кэш
    await this.invalidatePlanCache(planId);

    return { message: 'Период удалён' };
  }

  // Аналогичные методы для extraTraffic, extraBypassTraffic, extraDevices
  // Опускаю для краткости, но логика идентична
}
