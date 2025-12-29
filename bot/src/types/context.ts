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
    // Для редактирования тарифов и периодов
    editMode?:
      | 'name'
      | 'description'
      | 'traffic'
      | 'bypass'
      | 'devices'
      | 'period_duration'
      | 'period_price'
      | 'add_period';
    editPlanId?: string;
  };
}
