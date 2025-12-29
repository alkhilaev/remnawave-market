import { Markup } from 'telegraf';
import { BotContext } from '../types/context';
import { apiService } from '../index';

/**
 * Начало процесса создания тарифа - запрос названия
 */
export async function startCreatePlan(ctx: BotContext) {
  try {
    // Инициализируем сессию для создания тарифа
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.createPlan = {};
    ctx.session.editMode = 'create_plan_name';

    await ctx.editMessageText(
      '🆕 *Создание нового тарифа*\n\n' +
        '📝 *Шаг 1/6: Название*\n\n' +
        'Отправьте название тарифа (макс. 100 символов):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'admin_plans')]]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка при запуске создания тарифа:', error);
    await ctx.answerCbQuery('❌ Ошибка', { show_alert: true });
  }
}

/**
 * Обработка ввода при создании тарифа
 */
export async function handleCreatePlanInput(ctx: BotContext) {
  if (!ctx.session || !ctx.session.createPlan || !ctx.session.editMode) {
    return;
  }

  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const editMode = ctx.session.editMode;

  try {
    switch (editMode) {
      case 'create_plan_name':
        if (text.length === 0 || text.length > 100) {
          await ctx.reply('❌ Название должно быть от 1 до 100 символов');
          return;
        }
        ctx.session.createPlan.name = text;
        ctx.session.editMode = 'create_plan_description';
        await ctx.reply(
          `✅ Название: "${text}"\n\n` +
            '📄 *Шаг 2/6: Описание*\n\n' +
            'Отправьте описание тарифа (макс. 500 символов):',
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('⏭ Пропустить', 'create_skip_description')],
            ]),
          },
        );
        break;

      case 'create_plan_description':
        if (text.length > 500) {
          await ctx.reply('❌ Описание слишком длинное (макс. 500 символов)');
          return;
        }
        ctx.session.createPlan.description = text;
        ctx.session.editMode = 'create_plan_traffic';
        await ctx.reply(
          `✅ Описание сохранено\n\n` +
            '📊 *Шаг 3/6: Лимит трафика*\n\n' +
            'Отправьте лимит трафика в GB (0 для безлимита):',
          {
            parse_mode: 'Markdown',
          },
        );
        break;

      case 'create_plan_traffic':
        const traffic = parseInt(text);
        if (isNaN(traffic) || traffic < 0) {
          await ctx.reply('❌ Введите корректное число (0 или больше)');
          return;
        }
        ctx.session.createPlan.defaultTrafficLimitGB = traffic;
        ctx.session.editMode = 'create_plan_bypass';
        await ctx.reply(
          `✅ Лимит трафика: ${traffic === 0 ? 'Безлимит' : traffic + ' GB'}\n\n` +
            '🔄 *Шаг 4/6: Лимит обхода*\n\n' +
            'Отправьте лимит обхода заглушек в GB:',
          {
            parse_mode: 'Markdown',
          },
        );
        break;

      case 'create_plan_bypass':
        const bypass = parseInt(text);
        if (isNaN(bypass) || bypass < 0) {
          await ctx.reply('❌ Введите корректное число (0 или больше)');
          return;
        }
        ctx.session.createPlan.defaultBypassTrafficLimitGB = bypass;
        ctx.session.editMode = 'create_plan_devices';
        await ctx.reply(
          `✅ Лимит обхода: ${bypass} GB\n\n` +
            '📱 *Шаг 5/6: Количество устройств*\n\n' +
            'Отправьте максимальное количество устройств (минимум 1):',
          {
            parse_mode: 'Markdown',
          },
        );
        break;

      case 'create_plan_devices':
        const devices = parseInt(text);
        if (isNaN(devices) || devices < 1) {
          await ctx.reply('❌ Введите корректное число (минимум 1)');
          return;
        }
        ctx.session.createPlan.defaultDeviceLimit = devices;
        ctx.session.editMode = 'create_plan_period';
        await ctx.reply(
          `✅ Устройств: ${devices}\n\n` +
            '💰 *Шаг 6/6: Периоды подписки*\n\n' +
            'Отправьте данные в формате: `дни:цена`\n' +
            'Можно указать несколько периодов через пробел:\n\n' +
            'Примеры:\n' +
            '• `30:199` - один период\n' +
            '• `30:199 90:499 365:1499` - три периода',
          {
            parse_mode: 'Markdown',
          },
        );
        break;

      case 'create_plan_period':
        const periodParts = text.trim().split(/\s+/);
        const periods: Array<{ durationDays: number; price: number }> = [];

        for (const part of periodParts) {
          if (!part.includes(':')) {
            await ctx.reply(
              '❌ Неверный формат. Используйте формат `дни:цена`\n' +
                'Примеры:\n' +
                '• `30:199`\n' +
                '• `30:199 90:499 365:1499`',
              { parse_mode: 'Markdown' },
            );
            return;
          }

          const [daysStr, priceStr] = part.split(':', 2);
          const days = parseInt(daysStr);
          const price = parseFloat(priceStr);

          if (isNaN(days) || days < 1 || isNaN(price) || price < 0) {
            await ctx.reply(
              `❌ Некорректные значения в "${part}". Дни должны быть больше 0, цена не может быть отрицательной`,
            );
            return;
          }

          periods.push({ durationDays: days, price });
        }

        if (periods.length === 0) {
          await ctx.reply('❌ Нужно указать хотя бы один период');
          return;
        }

        // Сохраняем периоды в сессию
        ctx.session.createPlan.periods = periods;

        // Создаем тариф
        await createPlanFinalize(ctx);
        break;
    }
  } catch (error: any) {
    console.error('Ошибка при обработке ввода создания тарифа:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте снова или отмените создание командой /start');
  }
}

/**
 * Финализация создания тарифа - отправка на backend
 */
async function createPlanFinalize(ctx: BotContext) {
  if (!ctx.session?.createPlan) {
    await ctx.reply('❌ Ошибка: данные тарифа не найдены');
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('❌ Ошибка: не удалось определить пользователя');
    return;
  }

  const planData = ctx.session.createPlan;

  try {
    const loadingMsg = await ctx.reply('⏳ Создаю тариф...');

    // Создаем тариф
    const newPlan = await apiService.createPlan(
      {
        name: planData.name!,
        description: planData.description || '',
        defaultTrafficLimitGB: planData.defaultTrafficLimitGB!,
        defaultBypassTrafficLimitGB: planData.defaultBypassTrafficLimitGB!,
        defaultDeviceLimit: planData.defaultDeviceLimit!,
        isActive: true,
      },
      String(userId),
    );

    // Добавляем все периоды
    if (planData.periods && planData.periods.length > 0) {
      for (const period of planData.periods) {
        await apiService.addPeriod(
          newPlan.id,
          {
            durationDays: period.durationDays,
            price: period.price,
            isActive: true,
          },
          String(userId),
        );
      }
    }

    // Формируем список периодов для сообщения
    const periodsText = planData.periods
      ? planData.periods.map((p) => `${p.durationDays} дн. - ${p.price} ₽`).join(', ')
      : 'Не указаны';

    // Очищаем сессию
    delete ctx.session.createPlan;
    delete ctx.session.editMode;

    // Удаляем сообщение "Создаю тариф..."
    if (ctx.chat?.id) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch (e) {
        // Игнорируем ошибку если не удалось удалить
      }
    }

    // Показываем успешное создание
    const message =
      '✅ *Тариф успешно создан!*\n\n' +
      `📝 *Название:* ${planData.name}\n` +
      `📄 *Описание:* ${planData.description || 'Не указано'}\n` +
      `📊 *Трафик:* ${planData.defaultTrafficLimitGB === 0 ? 'Безлимит' : planData.defaultTrafficLimitGB + ' GB'}\n` +
      `🔄 *Обход:* ${planData.defaultBypassTrafficLimitGB} GB\n` +
      `📱 *Устройства:* ${planData.defaultDeviceLimit}\n` +
      `💰 *Периоды:* ${periodsText}`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('📝 Редактировать', `admin_plan_edit_${newPlan.id}`),
          Markup.button.callback('❌ Деактивировать', `admin_plan_toggle_${newPlan.id}`),
        ],
        [Markup.button.callback('◀️ К списку тарифов', 'admin_plans')],
      ]),
    });
  } catch (error: any) {
    console.error('Ошибка при создании тарифа:', error);
    let errorMessage = 'Ошибка при создании тарифа';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await ctx.reply(`❌ ${errorMessage}`);

    // Не очищаем сессию, чтобы пользователь мог попробовать снова
  }
}

/**
 * Пропуск описания
 */
export async function skipDescription(ctx: BotContext) {
  try {
    if (!ctx.session?.createPlan) {
      await ctx.answerCbQuery('❌ Ошибка', { show_alert: true });
      return;
    }

    ctx.session.createPlan.description = '';
    ctx.session.editMode = 'create_plan_traffic';

    await ctx.editMessageText(
      '⏭ Описание пропущено\n\n' +
        '📊 *Шаг 3/6: Лимит трафика*\n\n' +
        'Отправьте лимит трафика в GB (0 для безлимита):',
      {
        parse_mode: 'Markdown',
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка при пропуске описания:', error);
    await ctx.answerCbQuery('❌ Ошибка', { show_alert: true });
  }
}
