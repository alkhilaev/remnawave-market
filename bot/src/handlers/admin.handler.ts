import { Markup } from 'telegraf';
import { BotContext } from '../types/context';
import { apiService } from '../index';
import { currentLocale as t } from '../locales';

/**
 * Проверка является ли пользователь администратором
 */
export function isAdmin(userId: number): boolean {
  const adminIds = process.env.TELEGRAM_ADMIN_IDS || '';

  if (!adminIds.trim()) {
    return false;
  }

  const adminList = adminIds
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((id) => parseInt(id, 10));

  return adminList.includes(userId);
}

/**
 * Middleware для проверки прав администратора
 */
export async function requireAdmin(ctx: BotContext, next: () => Promise<void>) {
  const userId = ctx.from?.id;

  if (!userId || !isAdmin(userId)) {
    await ctx.answerCbQuery(t.admin.accessDenied, {
      show_alert: true,
    });
    return;
  }

  await next();
}

/**
 * Главная панель администратора
 */
export async function adminPanelHandler(ctx: BotContext) {
  await ctx.editMessageText(t.admin.panel.title, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(t.admin.panel.buttons.plans, 'admin_plans')],
      [Markup.button.callback(t.admin.panel.buttons.stats, 'admin_stats')],
      [Markup.button.callback(t.admin.panel.buttons.users, 'admin_users')],
      [Markup.button.callback(t.admin.panel.buttons.back, 'back_to_start')],
    ]),
  });
}

/**
 * Управление тарифами - список всех тарифов с кнопками редактирования
 */
export async function adminPlansHandler(ctx: BotContext) {
  try {
    const plans = await apiService.getPlans(true);

    if (!plans || plans.length === 0) {
      await ctx.editMessageText(t.admin.plans.noPlans, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'admin_panel')]]),
      });
      return;
    }

    const buttons = plans.map((plan) => [
      Markup.button.callback(
        `${plan.isActive ? '✅' : '❌'} ${plan.name}`,
        `admin_plan_${plan.id}`,
      ),
    ]);

    buttons.push([Markup.button.callback(t.admin.plans.createNew, 'admin_plan_create')]);
    buttons.push([Markup.button.callback(t.common.back, 'admin_panel')]);

    await ctx.editMessageText(t.admin.plans.title, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (error) {
    console.error('Ошибка при получении тарифов:', error);
    await ctx.editMessageText(t.errors.apiError, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'admin_panel')]]),
    });
  }
}

/**
 * Детальный просмотр тарифа с возможностью редактирования
 */
export async function adminPlanDetailHandler(ctx: BotContext, planId: string) {
  try {
    const plan = await apiService.getPlanById(planId);

    const message = t.admin.plans.details(plan);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            t.admin.plans.buttons.toggle(plan.isActive),
            `admin_plan_toggle_${planId}`,
          ),
        ],
        [Markup.button.callback(t.admin.plans.buttons.edit, `admin_plan_edit_${planId}`)],
        [Markup.button.callback(t.admin.plans.buttons.back, 'admin_plans')],
      ]),
    });
  } catch (error) {
    console.error('Ошибка при получении тарифа:', error);
    await ctx.editMessageText(t.errors.planNotFound, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'admin_plans')]]),
    });
  }
}

/**
 * Переключение активности тарифа
 */
export async function adminTogglePlanHandler(ctx: BotContext, planId: string) {
  try {
    const plan = await apiService.getPlanById(planId);
    const newStatus = !plan.isActive;

    await apiService.togglePlan(planId, newStatus);

    await ctx.answerCbQuery(t.admin.plans.toggled(newStatus), {
      show_alert: false,
    });

    // Обновляем сообщение с новым статусом
    await adminPlanDetailHandler(ctx, planId);
  } catch (error) {
    console.error('Ошибка при изменении статуса тарифа:', error);
    await ctx.answerCbQuery(t.errors.apiError, {
      show_alert: true,
    });
  }
}

/**
 * Статистика (заглушка)
 */
export async function adminStatsHandler(ctx: BotContext) {
  await ctx.editMessageText(
    `${t.admin.stats.title}\n\n${t.admin.stats.inDevelopment}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'admin_panel')]]),
    },
  );
}

/**
 * Управление пользователями (заглушка)
 */
export async function adminUsersHandler(ctx: BotContext) {
  await ctx.editMessageText(
    `${t.admin.users.title}\n\n${t.admin.users.inDevelopment}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'admin_panel')]]),
    },
  );
}

/**
 * Возврат в главное меню
 */
export async function backToStartHandler(ctx: BotContext) {
  const userId = ctx.from?.id;

  if (!userId) {
    return;
  }

  const userIsAdmin = isAdmin(userId);
  const welcomeMessage = userIsAdmin ? t.start.adminWelcome : t.start.welcome;

  if (userIsAdmin) {
    await ctx.editMessageText(welcomeMessage.trim(), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t.start.buttons.adminPanel, 'admin_panel')],
        [Markup.button.callback(t.start.buttons.viewPlans, 'view_plans')],
        [Markup.button.callback(t.start.buttons.help, 'help')],
      ]),
    });
  } else {
    await ctx.editMessageText(welcomeMessage.trim(), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t.start.buttons.viewPlans, 'view_plans')],
        [Markup.button.callback(t.start.buttons.help, 'help')],
      ]),
    });
  }
}
