import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { BotContext } from './types/context';
import { ApiService } from './services/api.service';
import {
  startHandler,
  helpHandler,
} from './handlers/start.handler';
import {
  createPlansHandler,
  createPlanDetailsHandler,
  createSelectPlanHandler,
} from './handlers/plans.handler';
import {
  requireAdmin,
  adminPanelHandler,
  adminPlansHandler,
  adminPlanDetailHandler,
  adminTogglePlanHandler,
  adminStatsHandler,
  adminUsersHandler,
  backToStartHandler,
} from './handlers/admin.handler';

// Загружаем переменные окружения
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.TELEGRAM_API_URL || 'http://localhost:3000/api/v1';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
  process.exit(1);
}

// Инициализация бота
const bot = new Telegraf<BotContext>(BOT_TOKEN);

// Инициализация API сервиса (экспортируем для использования в handlers)
export const apiService = new ApiService(API_URL);

// Простая сессия в памяти (для production использовать Redis/БД)
const sessions = new Map<number, any>();

bot.use((ctx, next) => {
  const userId = ctx.from?.id;
  if (userId) {
    if (!sessions.has(userId)) {
      sessions.set(userId, {});
    }
    ctx.session = sessions.get(userId);
  }
  return next();
});

// ============================================
// КОМАНДЫ
// ============================================

bot.command('start', startHandler);
bot.command('help', helpHandler);
bot.command('plans', createPlansHandler(apiService));

// ============================================
// CALLBACK QUERIES (кнопки)
// ============================================

// Главное меню
bot.action('back_to_main', async (ctx) => {
  await startHandler(ctx);
  await ctx.answerCbQuery();
});

// Помощь
bot.action('help', async (ctx) => {
  await helpHandler(ctx);
  await ctx.answerCbQuery();
});

// Просмотр тарифов
bot.action('view_plans', createPlansHandler(apiService));

// Просмотр конкретного тарифа
bot.action(/^plan_[a-zA-Z0-9-]+$/, createPlanDetailsHandler(apiService));

// Выбор тарифа
bot.action(/^select_plan_[a-zA-Z0-9-]+$/, createSelectPlanHandler(apiService));

// Выбор периода
bot.action(/^select_period_[a-zA-Z0-9-]+$/, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const periodId = ctx.callbackQuery.data.replace('select_period_', '');

  if (!ctx.session) {
    await ctx.answerCbQuery('❌ Сессия истекла. Начните сначала с /start');
    return;
  }

  ctx.session.selectedPeriodId = periodId;

  // TODO: Реализовать выбор дополнений и оплату
  await ctx.editMessageText(
    '✅ Период выбран!\n\n🚧 Функционал выбора дополнений и оплаты в разработке...',
    {
      parse_mode: 'Markdown',
    }
  );

  await ctx.answerCbQuery('Период выбран');
});

// ============================================
// АДМИН ПАНЕЛЬ (только для администраторов)
// ============================================

// Главная админ панель
bot.action('admin_panel', requireAdmin, async (ctx) => {
  await adminPanelHandler(ctx);
  await ctx.answerCbQuery();
});

// Управление тарифами
bot.action('admin_plans', requireAdmin, async (ctx) => {
  await adminPlansHandler(ctx);
  await ctx.answerCbQuery();
});

// Просмотр конкретного тарифа (для редактирования)
bot.action(/^admin_plan_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const planId = ctx.callbackQuery.data.replace('admin_plan_', '');

  // Проверяем, не является ли это действием toggle
  if (planId.startsWith('toggle_')) {
    return;
  }

  await adminPlanDetailHandler(ctx, planId);
  await ctx.answerCbQuery();
});

// Переключение активности тарифа
bot.action(/^admin_plan_toggle_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const planId = ctx.callbackQuery.data.replace('admin_plan_toggle_', '');
  await adminTogglePlanHandler(ctx, planId);
});

// Статистика
bot.action('admin_stats', requireAdmin, async (ctx) => {
  await adminStatsHandler(ctx);
  await ctx.answerCbQuery();
});

// Пользователи
bot.action('admin_users', requireAdmin, async (ctx) => {
  await adminUsersHandler(ctx);
  await ctx.answerCbQuery();
});

// Возврат в главное меню (из админ панели)
bot.action('back_to_start', async (ctx) => {
  await backToStartHandler(ctx);
  await ctx.answerCbQuery();
});

// ============================================
// ЗАПУСК БОТА
// ============================================

async function main() {
  console.log('🤖 Запуск Telegram бота...');
  console.log(`📡 API URL: ${API_URL}`);

  try {
    // Проверяем доступность API
    const plans = await apiService.getPlans();
    console.log(`✅ Подключение к API успешно. Найдено тарифов: ${plans.length}`);
  } catch (error) {
    console.warn('⚠️  Не удалось подключиться к API:', error);
    console.warn('⚠️  Бот запустится, но функции работы с тарифами могут не работать');
  }

  // Запускаем бота
  await bot.launch();
  console.log('✅ Бот успешно запущен!');

  // Graceful shutdown
  process.once('SIGINT', () => {
    console.log('\n🛑 Получен сигнал SIGINT. Останавливаем бота...');
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    console.log('\n🛑 Получен сигнал SIGTERM. Останавливаем бота...');
    bot.stop('SIGTERM');
  });
}

main().catch((error) => {
  console.error('❌ Критическая ошибка при запуске бота:', error);
  process.exit(1);
});
