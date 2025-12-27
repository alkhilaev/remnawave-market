import { Markup } from 'telegraf';
import { BotContext } from '../types/context';
import { ApiService } from '../services/api.service';
import { formatPrice, formatTraffic } from '../utils/formatters';

export function createPlansHandler(apiService: ApiService) {
  return async function plansHandler(ctx: BotContext) {
    try {
      await ctx.reply('⏳ Загружаю доступные тарифы...');

      const plans = await apiService.getPlans();

      if (!plans || plans.length === 0) {
        await ctx.reply('😔 К сожалению, сейчас нет доступных тарифов. Попробуйте позже.');
        return;
      }

      const buttons = plans.map(plan => [
        Markup.button.callback(
          `${plan.name} — от ${formatPrice(plan.periods[0]?.price || 0)}`,
          `plan_${plan.id}`
        )
      ]);

      buttons.push([Markup.button.callback('« Назад', 'back_to_main')]);

      await ctx.editMessageText(
        '📦 **Доступные тарифы:**\n\nВыберите интересующий вас тариф для просмотра деталей:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        }
      );
    } catch (error) {
      console.error('Ошибка при загрузке тарифов:', error);
      await ctx.reply('❌ Ошибка при загрузке тарифов. Попробуйте позже.');
    }
  };
}

export function createPlanDetailsHandler(apiService: ApiService) {
  return async function planDetailsHandler(ctx: BotContext) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const planId = ctx.callbackQuery.data.replace('plan_', '');

    try {
      const plan = await apiService.getPlan(planId);

      let message = `📦 **${plan.name}**\n\n`;

      if (plan.description) {
        message += `${plan.description}\n\n`;
      }

      message += `**Базовые параметры:**\n`;
      message += `• Трафик: ${formatTraffic(plan.defaultTrafficLimitGB)}\n`;

      if (plan.bypassTrafficEnabled) {
        message += `• Обход заглушек: ${formatTraffic(plan.defaultBypassTrafficLimitGB)}\n`;
      }

      message += `• Устройств: ${plan.defaultDeviceLimit}\n\n`;

      if (plan.periods.length > 0) {
        message += `**Доступные периоды:**\n`;
        plan.periods
          .filter(p => p.isActive)
          .forEach(period => {
            const days = period.durationDays;
            let periodName = `${days} дней`;
            if (days === 30) periodName = '1 месяц';
            if (days === 90) periodName = '3 месяца';
            if (days === 180) periodName = '6 месяцев';
            if (days === 365) periodName = '12 месяцев';
            message += `• ${periodName}: ${formatPrice(period.price)}\n`;
          });
      }

      const buttons = [
        [Markup.button.callback('✅ Выбрать этот тариф', `select_plan_${planId}`)],
        [Markup.button.callback('« К списку тарифов', 'view_plans')],
      ];

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Ошибка при загрузке деталей тарифа:', error);
      await ctx.answerCbQuery('❌ Ошибка при загрузке тарифа');
    }
  };
}

export function createSelectPlanHandler(apiService: ApiService) {
  return async function selectPlanHandler(ctx: BotContext) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const planId = ctx.callbackQuery.data.replace('select_plan_', '');

    try {
      const plan = await apiService.getPlan(planId);

      // Инициализируем сессию
      if (!ctx.session) {
        ctx.session = {};
      }
      ctx.session.selectedPlanId = planId;
      ctx.session.selectedExtras = {};

      // Показываем выбор периода
      const buttons = plan.periods
        .filter(p => p.isActive)
        .map(period => {
          const days = period.durationDays;
          let periodName = `${days} дней`;
          if (days === 30) periodName = '1 месяц';
          if (days === 90) periodName = '3 месяца';
          if (days === 180) periodName = '6 месяцев';
          if (days === 365) periodName = '12 месяцев';

          return [
            Markup.button.callback(
              `${periodName} — ${formatPrice(period.price)}`,
              `select_period_${period.id}`
            )
          ];
        });

      buttons.push([Markup.button.callback('« Назад', `plan_${planId}`)]);

      await ctx.editMessageText(
        `📅 **Выберите период подписки для тарифа "${plan.name}":**`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        }
      );

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Ошибка при выборе тарифа:', error);
      await ctx.answerCbQuery('❌ Ошибка');
    }
  };
}
