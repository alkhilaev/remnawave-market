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
      | 'add_period'
      | 'create_plan_name'
      | 'create_plan_description'
      | 'create_plan_traffic'
      | 'create_plan_bypass'
      | 'create_plan_devices'
      | 'create_plan_period';
    editPlanId?: string;
    // Для создания нового тарифа
    createPlan?: {
      name?: string;
      description?: string;
      defaultTrafficLimitGB?: number;
      defaultBypassTrafficLimitGB?: number;
      defaultDeviceLimit?: number;
      periods?: Array<{ durationDays: number; price: number }>;
    };
  };
}
