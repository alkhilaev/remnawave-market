import axios, { AxiosInstance } from 'axios';
import { VPNPlan } from '../types/api';

export class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Получить все активные тарифы (или включая неактивные для админов)
   */
  async getPlans(showInactive: boolean = false): Promise<VPNPlan[]> {
    try {
      const params = showInactive ? { showInactive: 'true' } : {};
      const response = await this.client.get<VPNPlan[]>('/plans', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении тарифов:', error);
      throw new Error('Не удалось получить список тарифов');
    }
  }

  /**
   * Получить конкретный тариф по ID
   */
  async getPlan(id: string): Promise<VPNPlan> {
    try {
      const response = await this.client.get<VPNPlan>(`/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении тарифа ${id}:`, error);
      throw new Error('Не удалось получить тариф');
    }
  }

  /**
   * Получить конкретный тариф по ID (алиас для админ панели)
   */
  async getPlanById(id: string): Promise<VPNPlan> {
    return this.getPlan(id);
  }

  /**
   * Рассчитать стоимость подписки
   */
  async calculatePrice(
    planId: string,
    periodId: string,
    extraTrafficId?: string,
    extraBypassTrafficId?: string,
    extraDevicesId?: string,
  ): Promise<{ totalPrice: number; breakdown: any }> {
    // TODO: Реализовать endpoint для расчёта стоимости на бэкенде
    // Пока что делаем расчёт на стороне бота
    const plan = await this.getPlan(planId);

    const period = plan.periods.find(p => p.id === periodId);
    if (!period) {
      throw new Error('Период не найден');
    }

    let totalPrice = parseFloat(period.price);
    const breakdown: any[] = [
      { name: `${plan.name} - ${period.durationDays} дней`, price: period.price }
    ];

    if (extraTrafficId) {
      const extra = plan.extraTraffic.find(e => e.id === extraTrafficId);
      if (extra) {
        totalPrice += parseFloat(extra.price);
        breakdown.push({ name: `Доп. трафик ${extra.trafficGB} GB`, price: extra.price });
      }
    }

    if (extraBypassTrafficId && plan.bypassTrafficEnabled) {
      const extra = plan.extraBypassTraffic.find(e => e.id === extraBypassTrafficId);
      if (extra) {
        totalPrice += parseFloat(extra.price);
        breakdown.push({ name: `Доп. обход ${extra.bypassTrafficGB} GB`, price: extra.price });
      }
    }

    if (extraDevicesId) {
      const extra = plan.extraDevices.find(e => e.id === extraDevicesId);
      if (extra) {
        totalPrice += parseFloat(extra.price);
        breakdown.push({ name: `Устройств: ${extra.deviceCount}`, price: extra.price });
      }
    }

    return { totalPrice, breakdown };
  }

  /**
   * Переключить активность тарифа (для админов)
   */
  async togglePlan(id: string, isActive: boolean): Promise<VPNPlan> {
    try {
      // TODO: Добавить JWT токен для авторизации админа
      const response = await this.client.patch<VPNPlan>(`/plans/${id}/toggle`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при изменении статуса тарифа ${id}:`, error);
      throw new Error('Не удалось изменить статус тарифа');
    }
  }
}
