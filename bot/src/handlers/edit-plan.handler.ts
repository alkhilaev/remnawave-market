import { Markup } from 'telegraf';
import { BotContext } from '../types/context';
import { apiService } from '../index';
import { t } from '../locales';

/**
 * Меню редактирования тарифа
 */
export async function editPlanMenuHandler(ctx: BotContext, planId: string) {
  try {
    const plan = await apiService.getPlanById(planId);

    const message =
      `📝 *Редактирование тарифа "${plan.name}"*\n\n` +
      `*Название:* ${plan.name}\n` +
      `*Описание:* ${plan.description || 'Не указано'}\n` +
      `*Лимит трафика:* ${plan.defaultTrafficLimitGB === 0 ? 'Безлимит' : plan.defaultTrafficLimitGB + ' GB'}\n` +
      `*Лимит обхода:* ${plan.defaultBypassTrafficLimitGB} GB\n` +
      `*Устройств:* ${plan.defaultDeviceLimit}\n\n` +
      `Выберите что хотите изменить:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(t.admin.plans.edit.buttons.name, `edit_name_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.description, `edit_desc_${planId}`),
        ],
        [
          Markup.button.callback(t.admin.plans.edit.buttons.traffic, `edit_traffic_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.bypass, `edit_bypass_${planId}`),
        ],
        [
          Markup.button.callback(t.admin.plans.edit.buttons.devices, `edit_devices_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.prices, `edit_prices_${planId}`),
        ],
        [Markup.button.callback(t.admin.plans.edit.buttons.back, `admin_plan_${planId}`)],
      ]),
    });
  } catch (error) {
    console.error('Ошибка при отображении меню редактирования:', error);
    await ctx.answerCbQuery('❌ Ошибка при загрузке данных', { show_alert: true });
  }
}

/**
 * Запрос на ввод нового названия
 */
export async function editPlanNamePrompt(ctx: BotContext, planId: string) {
  try {
    // Сохраняем состояние в сессию
    if (ctx.session) {
      ctx.session.editMode = 'name';
      ctx.session.editPlanId = planId;
    }

    await ctx.editMessageText(
      '📝 *Редактирование названия тарифа*\n\n' +
        'Отправьте новое название тарифа (макс. 100 символов):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `admin_plan_edit_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Запрос на ввод нового описания
 */
export async function editPlanDescPrompt(ctx: BotContext, planId: string) {
  try {
    if (ctx.session) {
      ctx.session.editMode = 'description';
      ctx.session.editPlanId = planId;
    }

    await ctx.editMessageText(
      '📄 *Редактирование описания тарифа*\n\n' +
        'Отправьте новое описание тарифа (макс. 500 символов):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `admin_plan_edit_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Обработка текстовых сообщений для редактирования
 */
export async function handleEditTextInput(ctx: BotContext) {
  if (!ctx.session || !ctx.session.editMode) {
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  const planId = ctx.session.editPlanId || ctx.session.selectedPlanId;
  const periodId = ctx.session.selectedPeriodId;
  const editMode = ctx.session.editMode;

  if (!planId) {
    await ctx.reply('❌ Ошибка: данные не найдены');
    delete ctx.session.editMode;
    return;
  }

  try {
    let updateData: any = {};

    switch (editMode) {
      case 'name':
        if (text.length > 100) {
          await ctx.reply('❌ Название слишком длинное (макс. 100 символов)');
          return;
        }
        updateData.name = text;
        await apiService.updatePlan(planId, updateData, String(userId));
        await ctx.reply(`✅ Название успешно изменено на: "${text}"`);
        break;

      case 'description':
        if (text.length > 500) {
          await ctx.reply('❌ Описание слишком длинное (макс. 500 символов)');
          return;
        }
        updateData.description = text;
        await apiService.updatePlan(planId, updateData, String(userId));
        await ctx.reply(`✅ Описание успешно изменено`);
        break;

      case 'traffic':
        const traffic = parseInt(text);
        if (isNaN(traffic) || traffic < 0) {
          await ctx.reply('❌ Введите корректное число (0 для безлимита)');
          return;
        }
        updateData.defaultTrafficLimitGB = traffic;
        await apiService.updatePlan(planId, updateData, String(userId));
        await ctx.reply(
          `✅ Лимит трафика изменен на: ${traffic === 0 ? 'Безлимит' : traffic + ' GB'}`,
        );
        break;

      case 'bypass':
        const bypass = parseInt(text);
        if (isNaN(bypass) || bypass < 0) {
          await ctx.reply('❌ Введите корректное число');
          return;
        }
        updateData.defaultBypassTrafficLimitGB = bypass;
        await apiService.updatePlan(planId, updateData, String(userId));
        await ctx.reply(`✅ Лимит обхода изменен на: ${bypass} GB`);
        break;

      case 'devices':
        const devices = parseInt(text);
        if (isNaN(devices) || devices < 1) {
          await ctx.reply('❌ Введите корректное число (минимум 1)');
          return;
        }
        updateData.defaultDeviceLimit = devices;
        await apiService.updatePlan(planId, updateData, String(userId));
        await ctx.reply(`✅ Количество устройств изменено на: ${devices}`);
        break;

      case 'period_duration':
        if (!periodId) {
          await ctx.reply('❌ Период не выбран');
          return;
        }
        const duration = parseInt(text);
        if (isNaN(duration) || duration < 1) {
          await ctx.reply('❌ Введите корректное число дней (минимум 1)');
          return;
        }
        await apiService.updatePeriod(planId, periodId, { durationDays: duration }, String(userId));
        await ctx.reply(`✅ Длительность периода изменена на: ${duration} дн.`);
        // Очищаем editMode и показываем меню периода
        delete ctx.session.editMode;
        await editPeriodMenuHandler(ctx, periodId);
        return;

      case 'period_price':
        if (!periodId) {
          await ctx.reply('❌ Период не выбран');
          return;
        }
        const price = parseFloat(text);
        if (isNaN(price) || price < 0) {
          await ctx.reply('❌ Введите корректную цену (число больше 0)');
          return;
        }
        await apiService.updatePeriod(planId, periodId, { price: price }, String(userId));
        await ctx.reply(`✅ Цена периода изменена на: ${price} ₽`);
        // Очищаем editMode и показываем меню периода
        delete ctx.session.editMode;
        await editPeriodMenuHandler(ctx, periodId);
        return;

      case 'add_period':
        if (!text.includes(':')) {
          await ctx.reply('❌ Неверный формат. Используйте: `дни:цена`, например: `30:199`', {
            parse_mode: 'Markdown',
          });
          return;
        }
        const [daysStr, priceStr] = text.trim().split(':', 2);
        const newDuration = parseInt(daysStr);
        const newPrice = parseFloat(priceStr);
        if (isNaN(newDuration) || newDuration < 1 || isNaN(newPrice) || newPrice < 0) {
          await ctx.reply(
            '❌ Некорректные значения. Дни должны быть больше 0, цена не может быть отрицательной',
          );
          return;
        }
        await apiService.addPeriod(
          planId,
          { durationDays: newDuration, price: newPrice, isActive: true },
          String(userId),
        );
        await ctx.reply(`✅ Период добавлен: ${newDuration} дн. за ${newPrice} ₽`);
        // Очищаем editMode и показываем список периодов
        delete ctx.session.editMode;
        await editPlanPricesHandler(ctx, planId);
        return;
    }

    // Очищаем сессию
    delete ctx.session.editMode;
    delete ctx.session.editPlanId;

    // Показываем обновленное меню редактирования
    const plan = await apiService.getPlanById(planId);
    const message =
      `📝 *Редактирование тарифа "${plan.name}"*\n\n` +
      `*Название:* ${plan.name}\n` +
      `*Описание:* ${plan.description || 'Не указано'}\n` +
      `*Лимит трафика:* ${plan.defaultTrafficLimitGB === 0 ? 'Безлимит' : plan.defaultTrafficLimitGB + ' GB'}\n` +
      `*Лимит обхода:* ${plan.defaultBypassTrafficLimitGB} GB\n` +
      `*Устройств:* ${plan.defaultDeviceLimit}\n\n` +
      `Выберите что хотите изменить:`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(t.admin.plans.edit.buttons.name, `edit_name_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.description, `edit_desc_${planId}`),
        ],
        [
          Markup.button.callback(t.admin.plans.edit.buttons.traffic, `edit_traffic_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.bypass, `edit_bypass_${planId}`),
        ],
        [
          Markup.button.callback(t.admin.plans.edit.buttons.devices, `edit_devices_${planId}`),
          Markup.button.callback(t.admin.plans.edit.buttons.prices, `edit_prices_${planId}`),
        ],
        [Markup.button.callback(t.admin.plans.edit.buttons.back, `admin_plan_${planId}`)],
      ]),
    });
  } catch (error: any) {
    console.error('Ошибка при обновлении тарифа:', error);
    let errorMessage = 'Ошибка при обновлении';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await ctx.reply(`❌ ${errorMessage}`);

    // Очищаем сессию даже при ошибке
    delete ctx.session.editMode;
    delete ctx.session.editPlanId;
  }
}

// Промпты для других полей
export async function editPlanTrafficPrompt(ctx: BotContext, planId: string) {
  try {
    if (ctx.session) {
      ctx.session.editMode = 'traffic';
      ctx.session.editPlanId = planId;
    }

    await ctx.editMessageText(
      '📊 *Редактирование лимита трафика*\n\n' +
        'Отправьте новый лимит трафика в GB (0 для безлимита):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `admin_plan_edit_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

export async function editPlanBypassPrompt(ctx: BotContext, planId: string) {
  try {
    if (ctx.session) {
      ctx.session.editMode = 'bypass';
      ctx.session.editPlanId = planId;
    }

    await ctx.editMessageText(
      '🔄 *Редактирование лимита обхода*\n\n' + 'Отправьте новый лимит обхода в GB:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `admin_plan_edit_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

export async function editPlanDevicesPrompt(ctx: BotContext, planId: string) {
  try {
    if (ctx.session) {
      ctx.session.editMode = 'devices';
      ctx.session.editPlanId = planId;
    }

    await ctx.editMessageText(
      '📱 *Редактирование количества устройств*\n\n' +
        'Отправьте новое количество устройств (минимум 1):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `admin_plan_edit_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Меню управления ценами (периодами)
 */
export async function editPlanPricesHandler(ctx: BotContext, planId: string) {
  try {
    console.log(`📝 Открытие меню цен для тарифа: ${planId}`);
    const plan = await apiService.getPlanById(planId, true); // Включаем неактивные периоды

    // Сохраняем planId в сессию для использования при редактировании периодов
    if (ctx.session) {
      ctx.session.selectedPlanId = planId;
    }

    let message = `💰 *Управление периодами тарифа "${plan.name}"*\n\n`;

    if (plan.periods && plan.periods.length > 0) {
      message += '*Текущие периоды:*\n\n';
      plan.periods.forEach((period, index) => {
        message += `${index + 1}. *${period.durationDays} дн.* - ${period.price} ₽\n`;
      });
    } else {
      message += '❌ Нет доступных периодов\n';
    }

    message += '\n\nВыберите период для редактирования:';

    const buttons = [];

    // Кнопки для каждого периода в 2 колонки
    if (plan.periods && plan.periods.length > 0) {
      for (let i = 0; i < plan.periods.length; i += 2) {
        const row = [];
        const period1 = plan.periods[i];
        const status1 = period1.isActive ? '✅' : '❌';
        row.push(
          Markup.button.callback(`${status1} ${period1.durationDays} дн.`, `per_${period1.id}`),
        );

        if (i + 1 < plan.periods.length) {
          const period2 = plan.periods[i + 1];
          const status2 = period2.isActive ? '✅' : '❌';
          row.push(
            Markup.button.callback(`${status2} ${period2.durationDays} дн.`, `per_${period2.id}`),
          );
        }
        buttons.push(row);
      }
    }

    // Кнопка добавить период
    buttons.push([Markup.button.callback(t.admin.plans.periods.buttons.add, `add_per`)]);

    // Кнопка назад
    buttons.push([
      Markup.button.callback(t.admin.plans.periods.buttons.back, `admin_plan_edit_${planId}`),
    ]);

    const keyboard = {
      parse_mode: 'Markdown' as const,
      ...Markup.inlineKeyboard(buttons),
    };

    // Если это callback query - редактируем сообщение, если текст - отправляем новое
    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, keyboard);
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, keyboard);
    }
  } catch (error) {
    console.error('Ошибка при отображении цен:', error);
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('❌ Ошибка при загрузке данных', { show_alert: true });
    }
  }
}

/**
 * Меню редактирования конкретного периода
 */
export async function editPeriodMenuHandler(ctx: BotContext, periodId: string) {
  try {
    const planId = ctx.session?.selectedPlanId;
    if (!planId) {
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery('❌ Ошибка: план не выбран', { show_alert: true });
      }
      return;
    }

    const plan = await apiService.getPlanById(planId, true); // Включаем неактивные периоды
    const period = plan.periods.find((p) => p.id === periodId);

    if (!period) {
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery('❌ Период не найден', { show_alert: true });
      }
      return;
    }

    // Сохраняем periodId в сессию
    if (ctx.session) {
      ctx.session.selectedPeriodId = periodId;
    }

    const statusText = period.isActive ? '✅ Активен' : '❌ Неактивен';
    const message =
      `📝 *Редактирование периода*\n\n` +
      `*Длительность:* ${period.durationDays} дн.\n` +
      `*Цена:* ${period.price} ₽\n` +
      `*Статус:* ${statusText}\n\n` +
      `Выберите действие:`;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          t.admin.plans.periods.buttons.editDuration,
          `per_edit_dur_${periodId}`,
        ),
      ],
      [
        Markup.button.callback(
          t.admin.plans.periods.buttons.editPrice,
          `per_edit_price_${periodId}`,
        ),
      ],
      [
        Markup.button.callback(
          period.isActive ? '❌ Отключить' : '✅ Включить',
          `per_toggle_${periodId}`,
        ),
      ],
      [Markup.button.callback(t.admin.plans.periods.buttons.delete, `per_delete_${periodId}`)],
      [Markup.button.callback(t.admin.plans.periods.buttons.back, `edit_prices_${planId}`)],
    ]);

    // Если это callback query - редактируем сообщение, если текст - отправляем новое
    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    }
  } catch (error) {
    console.error('Ошибка при отображении периода:', error);
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('❌ Ошибка при загрузке данных', { show_alert: true });
    }
  }
}

/**
 * Переключение статуса периода (вкл/выкл)
 */
export async function togglePeriodHandler(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    const planId = ctx.session?.selectedPlanId;
    const periodId = ctx.session?.selectedPeriodId;

    if (!userId || !planId || !periodId) {
      await ctx.answerCbQuery('❌ Ошибка: данные не найдены', { show_alert: true });
      return;
    }

    // Получаем текущий статус периода
    const plan = await apiService.getPlanById(planId, true); // Включаем неактивные периоды
    const period = plan.periods.find((p) => p.id === periodId);
    if (!period) {
      await ctx.answerCbQuery('❌ Период не найден', { show_alert: true });
      return;
    }

    // Переключаем статус
    const newStatus = !period.isActive;
    await apiService.togglePeriod(planId, periodId, newStatus, String(userId));
    await ctx.answerCbQuery('✅ Статус периода изменен');

    // Обновляем меню
    await editPeriodMenuHandler(ctx, periodId);
  } catch (error: any) {
    console.error('Ошибка при переключении статуса периода:', error);
    let errorMessage = 'Ошибка при изменении статуса';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await ctx.answerCbQuery(`❌ ${errorMessage}`, { show_alert: true });
  }
}

/**
 * Удаление периода
 */
export async function deletePeriodHandler(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    const planId = ctx.session?.selectedPlanId;
    const periodId = ctx.session?.selectedPeriodId;

    if (!userId || !planId || !periodId) {
      await ctx.answerCbQuery('❌ Ошибка: данные не найдены', { show_alert: true });
      return;
    }

    await apiService.deletePeriod(planId, periodId, String(userId));
    await ctx.answerCbQuery('✅ Период удален');

    // Очищаем periodId из сессии
    if (ctx.session) {
      delete ctx.session.selectedPeriodId;
    }

    // Возвращаем в список периодов
    await editPlanPricesHandler(ctx, planId);
  } catch (error: any) {
    console.error('Ошибка при удалении периода:', error);
    let errorMessage = 'Ошибка при удалении периода';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    await ctx.answerCbQuery(`❌ ${errorMessage}`, { show_alert: true });
  }
}

/**
 * Промпт на ввод длительности периода
 */
export async function editPeriodDurationPrompt(ctx: BotContext) {
  try {
    const planId = ctx.session?.selectedPlanId;
    if (!planId) return;

    if (ctx.session) {
      ctx.session.editMode = 'period_duration';
    }

    await ctx.editMessageText(
      '📅 *Изменение длительности периода*\n\n' +
        'Отправьте новую длительность в днях (например: 30, 90, 365):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              t.admin.plans.buttons.cancel,
              `per_${ctx.session?.selectedPeriodId}`,
            ),
          ],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Промпт на ввод цены периода
 */
export async function editPeriodPricePrompt(ctx: BotContext) {
  try {
    const planId = ctx.session?.selectedPlanId;
    if (!planId) return;

    if (ctx.session) {
      ctx.session.editMode = 'period_price';
    }

    await ctx.editMessageText(
      '💰 *Изменение цены периода*\n\n' + 'Отправьте новую цену в рублях (например: 199, 499):',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              t.admin.plans.buttons.cancel,
              `per_${ctx.session?.selectedPeriodId}`,
            ),
          ],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Промпт на добавление нового периода
 */
export async function addPeriodPrompt(ctx: BotContext) {
  try {
    const planId = ctx.session?.selectedPlanId;
    if (!planId) return;

    if (ctx.session) {
      ctx.session.editMode = 'add_period';
    }

    await ctx.editMessageText(
      '➕ *Добавление нового периода*\n\n' +
        'Отправьте данные в формате: `дни:цена`\n\n' +
        'Например: `30:199` или `90:499`',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.admin.plans.buttons.cancel, `edit_prices_${planId}`)],
        ]),
      },
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
