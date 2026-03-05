/**
 * VPNPlan Entity для работы с бизнес-логикой
 */
export class VPNPlanEntity {
  id: string;
  name: string;
  description: string | null;
  defaultTrafficLimitGB: number;
  defaultBypassTrafficLimitGB: number;
  defaultDeviceLimit: number;
  bypassTrafficEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<VPNPlanEntity>) {
    Object.assign(this, data);
  }

  /**
   * Проверка является ли тариф активным
   */
  isActivePlan(): boolean {
    return this.isActive;
  }

  /**
   * Проверка включён ли bypass трафик
   */
  hasBypassTraffic(): boolean {
    return this.bypassTrafficEnabled;
  }

  /**
   * Получение лимита трафика в байтах
   */
  getTrafficLimitBytes(): bigint {
    return BigInt(this.defaultTrafficLimitGB) * BigInt(1024 * 1024 * 1024);
  }

  /**
   * Получение лимита bypass трафика в байтах
   */
  getBypassTrafficLimitBytes(): bigint {
    return BigInt(this.defaultBypassTrafficLimitGB) * BigInt(1024 * 1024 * 1024);
  }
}
