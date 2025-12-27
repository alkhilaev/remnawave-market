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
   * Получить все активные тарифы
   */
  async getPlans(): Promise<VPNPlan[]> {
    try {
      const response = await this.client.get<VPNPlan[]>('/plans');
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
}
