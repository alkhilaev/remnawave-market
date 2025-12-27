import axios, { AxiosInstance } from 'axios';
import { VPNPlan } from '../types/api';

export class ApiService {
  private client: AxiosInstance;
  private tokens: Map<string, string> = new Map(); // telegramId -> JWT token

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
   * Установить JWT токен для пользователя
   */
  setToken(telegramId: string, token: string): void {
    this.tokens.set(telegramId, token);
  }

  /**
   * Получить JWT токен для пользователя
   */
  getToken(telegramId: string): string | undefined {
    return this.tokens.get(telegramId);
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

    const period = plan.periods.find((p) => p.id === periodId);
    if (!period) {
      throw new Error('Период не найден');
    }

    let totalPrice = parseFloat(period.price);
    const breakdown: any[] = [
      { name: `${plan.name} - ${period.durationDays} дней`, price: period.price },
    ];

    if (extraTrafficId) {
      const extra = plan.extraTraffic.find((e) => e.id === extraTrafficId);
      if (extra) {
        totalPrice += parseFloat(extra.price);
        breakdown.push({ name: `Доп. трафик ${extra.trafficGB} GB`, price: extra.price });
      }
    }

    if (extraBypassTrafficId && plan.bypassTrafficEnabled) {
      const extra = plan.extraBypassTraffic.find((e) => e.id === extraBypassTrafficId);
      if (extra) {
        totalPrice += parseFloat(extra.price);
        breakdown.push({ name: `Доп. обход ${extra.bypassTrafficGB} GB`, price: extra.price });
      }
    }

    if (extraDevicesId) {
      const extra = plan.extraDevices.find((e) => e.id === extraDevicesId);
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
  async togglePlan(id: string, isActive: boolean, telegramId?: string): Promise<VPNPlan> {
    try {
      const headers: any = {};

      // Добавляем JWT токен если есть
      if (telegramId) {
        const token = this.getToken(telegramId);
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await this.client.patch<VPNPlan>(
        `/plans/${id}/toggle`,
        { isActive },
        { headers },
      );
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка при изменении статуса тарифа ${id}:`, error);
      // Пробрасываем оригинальную ошибку для обработки в handler
      throw error;
    }
  }

  /**
   * Telegram авторизация пользователя
   */
  async telegramAuth(telegramData: {
    telegramId: string;
    telegramUsername?: string;
    telegramFirstName?: string;
    telegramLastName?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/auth/telegram', telegramData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при Telegram авторизации:', error);
      throw new Error('Не удалось авторизовать пользователя');
    }
  }
}
