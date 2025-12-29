import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { BotContext } from './types/context';
import { ApiService } from './services/api.service';
import { startHandler, helpHandler } from './handlers/start.handler';
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
  adminEditPlanHandler,
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

// Middleware для автоматической синхронизации данных пользователя
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;

  if (userId) {
    try {
      // Обновляем данные пользователя при каждом взаимодействии
      const authResponse = await apiService.telegramAuth({
        telegramId: String(userId),
        telegramUsername: ctx.from?.username,
        telegramFirstName: ctx.from?.first_name,
        telegramLastName: ctx.from?.last_name,
      });

      // Сохраняем JWT токен для дальнейших запросов
      if (authResponse.accessToken) {
        apiService.setToken(String(userId), authResponse.accessToken);
      }
    } catch (error) {
      // Игнорируем ошибки синхронизации, чтобы не блокировать работу бота
      console.error('Ошибка при синхронизации данных пользователя:', error);
    }
  }

  return next();
});

// ============================================
// КОМАНДЫ
// ============================================

bot.command('start', startHandler);
bot.command('help', helpHandler);
bot.command('plans', createPlansHandler(apiService));

// Обработчик текстовых сообщений для редактирования и создания тарифов
bot.on('text', async (ctx, next) => {
  // Проверяем есть ли режим редактирования или создания
  if (ctx.session && ctx.session.editMode) {
    // Если режим создания тарифа
    if (ctx.session.editMode.startsWith('create_plan_')) {
      const { handleCreatePlanInput } = await import('./handlers/create-plan.handler');
      await handleCreatePlanInput(ctx);
      return;
    }

    // Если режим редактирования
    const { handleEditTextInput } = await import('./handlers/edit-plan.handler');
    await handleEditTextInput(ctx);
    return;
  }

  // Если нет режима редактирования, передаём дальше
  return next();
});

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
    },
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

// Создание нового тарифа (должно быть ПЕРЕД общим pattern)
bot.action('admin_plan_create', requireAdmin, async (ctx) => {
  const { startCreatePlan } = await import('./handlers/create-plan.handler');
  await startCreatePlan(ctx);
});

// Просмотр конкретного тарифа (для редактирования)
bot.action(/^admin_plan_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const planId = ctx.callbackQuery.data.replace('admin_plan_', '');

  // Проверяем, не является ли это действием toggle или create
  if (planId.startsWith('toggle_') || planId === 'create' || planId === 'edit_') {
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

// Редактирование тарифа
bot.action(/^admin_plan_edit_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

  const planId = ctx.callbackQuery.data.replace('admin_plan_edit_', '');
  await adminEditPlanHandler(ctx, planId);
});

// Обработчики для редактирования полей тарифа
bot.action(/^edit_name_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_name_', '');
  const { editPlanNamePrompt } = await import('./handlers/edit-plan.handler');
  await editPlanNamePrompt(ctx, planId);
});

bot.action(/^edit_desc_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_desc_', '');
  const { editPlanDescPrompt } = await import('./handlers/edit-plan.handler');
  await editPlanDescPrompt(ctx, planId);
});

bot.action(/^edit_traffic_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_traffic_', '');
  const { editPlanTrafficPrompt } = await import('./handlers/edit-plan.handler');
  await editPlanTrafficPrompt(ctx, planId);
});

bot.action(/^edit_bypass_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_bypass_', '');
  const { editPlanBypassPrompt } = await import('./handlers/edit-plan.handler');
  await editPlanBypassPrompt(ctx, planId);
});

bot.action(/^edit_devices_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_devices_', '');
  const { editPlanDevicesPrompt } = await import('./handlers/edit-plan.handler');
  await editPlanDevicesPrompt(ctx, planId);
});

bot.action(/^edit_prices_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const planId = ctx.callbackQuery.data.replace('edit_prices_', '');
  const { editPlanPricesHandler } = await import('./handlers/edit-plan.handler');
  await editPlanPricesHandler(ctx, planId);
});

// Обработчики для периодов
bot.action(/^per_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const periodId = ctx.callbackQuery.data.replace('per_', '');
  const { editPeriodMenuHandler } = await import('./handlers/edit-plan.handler');
  await editPeriodMenuHandler(ctx, periodId);
});

bot.action('add_per', requireAdmin, async (ctx) => {
  const { addPeriodPrompt } = await import('./handlers/edit-plan.handler');
  await addPeriodPrompt(ctx);
});

bot.action(/^per_edit_dur_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const periodId = ctx.callbackQuery.data.replace('per_edit_dur_', '');
  // Сохраняем periodId в сессию
  if (ctx.session) {
    ctx.session.selectedPeriodId = periodId;
  }
  const { editPeriodDurationPrompt } = await import('./handlers/edit-plan.handler');
  await editPeriodDurationPrompt(ctx);
});

bot.action(/^per_edit_price_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const periodId = ctx.callbackQuery.data.replace('per_edit_price_', '');
  // Сохраняем periodId в сессию
  if (ctx.session) {
    ctx.session.selectedPeriodId = periodId;
  }
  const { editPeriodPricePrompt } = await import('./handlers/edit-plan.handler');
  await editPeriodPricePrompt(ctx);
});

bot.action(/^per_toggle_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const periodId = ctx.callbackQuery.data.replace('per_toggle_', '');
  // Сохраняем periodId в сессию
  if (ctx.session) {
    ctx.session.selectedPeriodId = periodId;
  }
  const { togglePeriodHandler } = await import('./handlers/edit-plan.handler');
  await togglePeriodHandler(ctx);
});

bot.action(/^per_delete_[a-zA-Z0-9-]+$/, requireAdmin, async (ctx) => {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  const periodId = ctx.callbackQuery.data.replace('per_delete_', '');
  // Сохраняем periodId в сессию
  if (ctx.session) {
    ctx.session.selectedPeriodId = periodId;
  }
  const { deletePeriodHandler } = await import('./handlers/edit-plan.handler');
  await deletePeriodHandler(ctx);
});

// Пропуск описания при создании тарифа
bot.action('create_skip_description', requireAdmin, async (ctx) => {
  const { skipDescription } = await import('./handlers/create-plan.handler');
  await skipDescription(ctx);
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

async function waitForAPI(maxRetries = 10, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const plans = await apiService.getPlans();
      console.log(`✅ Подключение к API успешно. Найдено тарифов: ${plans.length}`);
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.warn('⚠️  Не удалось подключиться к API после всех попыток');
        console.warn('⚠️  Бот запустится, но функции работы с тарифами могут не работать');
        return;
      }
      console.log(`⏳ Ожидание API... попытка ${i + 1}/${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function main() {
  console.log('🤖 Запуск Telegram бота...');
  console.log(`📡 API URL: ${API_URL}`);

  // Ждём доступности API с retry
  await waitForAPI();

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
