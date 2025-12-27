import { Markup } from 'telegraf';
import { BotContext } from '../types/context';
import { currentLocale as t } from '../locales';

/**
 * Проверка является ли пользователь администратором
 */
function isAdmin(userId: number): boolean {
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

export async function startHandler(ctx: BotContext) {
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.reply('❌ Не удалось получить ваш ID. Попробуйте ещё раз.');
    return;
  }

  const userIsAdmin = isAdmin(userId);
  const welcomeMessage = userIsAdmin ? t.start.adminWelcome : t.start.welcome;

  if (userIsAdmin) {
    await ctx.reply(welcomeMessage.trim(), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t.start.buttons.adminPanel, 'admin_panel')],
        [Markup.button.callback(t.start.buttons.viewPlans, 'view_plans')],
        [Markup.button.callback(t.start.buttons.help, 'help')],
      ]),
    });
  } else {
    await ctx.reply(welcomeMessage.trim(), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t.start.buttons.viewPlans, 'view_plans')],
        [Markup.button.callback(t.start.buttons.help, 'help')],
      ]),
    });
  }
}

export async function helpHandler(ctx: BotContext) {
  await ctx.reply(t.help.message, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.callback(t.common.back, 'back_to_main')]]),
  });
}
