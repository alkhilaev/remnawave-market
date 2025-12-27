import { Context } from 'telegraf';

export interface BotContext extends Context {
  // Здесь можно добавить кастомные поля в контекст бота
  session?: {
    selectedPlanId?: string;
    selectedPeriodId?: string;
    selectedExtras?: {
      trafficId?: string;
      bypassTrafficId?: string;
      devicesId?: string;
    };
  };
}
