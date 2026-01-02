/**
 * Русская локализация для Telegram бота
 */

export const ru = {
  // Общие
  common: {
    back: '🔙 Назад',
    cancel: '❌ Отмена',
    close: '✖️ Закрыть',
    yes: '✅ Да',
    no: '❌ Нет',
    loading: '⏳ Загрузка...',
    error: '❌ Произошла ошибка',
  },

  // Команда /start
  start: {
    welcome: `👋 Добро пожаловать в Remnawave Market!

Здесь вы можете приобрести VPN подписки с доступом к высокоскоростным серверам.`,
    adminWelcome: `👨‍💼 Добро пожаловать, администратор!

У вас есть доступ к админ панели для управления системой.`,
    buttons: {
      viewPlans: '📦 Посмотреть тарифы',
      help: 'ℹ️ Помощь',
      adminPanel: '⚙️ Админ панель',
    },
  },

  // Помощь
  help: {
    message: `ℹ️ **Помощь**

*Доступные команды:*
/start - Главное меню
/plans - Посмотреть все тарифы
/help - Эта справка

*Как купить VPN:*
1️⃣ Выберите подходящий тариф
2️⃣ Выберите период подписки
3️⃣ Оплатите удобным способом
4️⃣ Получите доступ к VPN

По всем вопросам обращайтесь в поддержку.`,
  },

  // Тарифы
  plans: {
    title: '📦 Доступные тарифы',
    noPlan: 'Тарифы не найдены',
    details: (plan: {
      name: string;
      description: string | null;
      defaultTrafficLimitGB: number;
      defaultBypassTrafficLimitGB: number;
      defaultDeviceLimit: number;
      bypassTrafficEnabled: boolean;
    }) => `📦 **${plan.name}**

${plan.description || 'Без описания'}

*Характеристики:*
• Трафик: ${plan.defaultTrafficLimitGB} GB
${plan.bypassTrafficEnabled ? `• Обход блокировок: ${plan.defaultBypassTrafficLimitGB} GB` : ''}
• Устройств: ${plan.defaultDeviceLimit}`,
    selectPeriod: 'Выберите период подписки:',
    period: (days: number, price: string) => `${days} дней - ${price} ₽`,
    selected: '✅ Тариф выбран',
    buttons: {
      back: '🔙 Назад',
      backToMain: '🔙 Назад',
      backToList: '🔙 К списку тарифов',
      select: '✅ Выбрать этот тариф',
    },
  },

  // Админ панель
  admin: {
    accessDenied: '❌ Доступ запрещён: только для администраторов',
    panel: {
      title: '⚙️ **Админ панель**\n\nВыберите действие:',
      buttons: {
        plans: '📦 Тарифы',
        stats: '📊 Статистика',
        users: '👥 Пользователи',
        back: '🔙 Назад',
      },
    },
    plans: {
      title: '📦 **Управление тарифами**\n\nВыберите тариф для редактирования:',
      noPlans: 'Тарифы не найдены',
      createNew: '➕ Создать новый тариф',
      details: (plan: {
        name: string;
        description: string | null;
        isActive: boolean;
        defaultTrafficLimitGB: number;
        defaultBypassTrafficLimitGB: number;
        defaultDeviceLimit: number;
        bypassTrafficEnabled: boolean;
        createdAt: string;
      }) => `📦 **${plan.name}**

*Статус:* ${plan.isActive ? '✅ Активен' : '❌ Неактивен'}

*Описание:*
${plan.description || 'Без описания'}

*Характеристики:*
• Трафик: ${plan.defaultTrafficLimitGB} GB
${plan.bypassTrafficEnabled ? `• Обход блокировок: ${plan.defaultBypassTrafficLimitGB} GB` : ''}
• Устройств: ${plan.defaultDeviceLimit}

*Создан:* ${new Date(plan.createdAt).toLocaleString('ru-RU')}`,
      buttons: {
        toggle: (isActive: boolean) => (isActive ? '❌ Деактивировать' : '✅ Активировать'),
        edit: '✏️ Редактировать',
        back: '🔙 Назад к списку',
        backToList: '🔙 К списку тарифов',
        cancel: '❌ Отмена',
        skip: '⏭ Пропустить',
      },
      toggled: (isActive: boolean) => `✅ Тариф ${isActive ? 'активирован' : 'деактивирован'}`,
      edit: {
        title: '✏️ **Редактирование тарифа**\n\nВыберите параметр для изменения:',
        buttons: {
          name: '📝 Название',
          description: '📄 Описание',
          traffic: '📊 Лимит трафика',
          bypass: '🔄 Лимит обхода',
          devices: '📱 Устройства',
          prices: '💰 Цены',
          back: '🔙 Назад',
        },
        prompts: {
          name: 'Введите новое название тарифа:',
          description: 'Введите новое описание тарифа:',
          traffic: 'Введите новый лимит трафика (в GB):',
          bypass: 'Введите новый лимит обхода (в GB):',
          devices: 'Введите новое количество устройств:',
        },
        success: {
          name: '✅ Название изменено',
          description: '✅ Описание изменено',
          traffic: '✅ Лимит трафика изменён',
          bypass: '✅ Лимит обхода изменён',
          devices: '✅ Количество устройств изменено',
        },
      },
      periods: {
        title: '💰 **Управление периодами**',
        noPeriods: 'Нет периодов',
        format: (days: number, price: number, isActive: boolean) =>
          `${isActive ? '✅' : '❌'} ${days} дней - ${price} ₽`,
        buttons: {
          add: '➕ Добавить период',
          editDuration: '📅 Изменить длительность',
          editPrice: '💰 Изменить цену',
          toggle: (isActive: boolean) => (isActive ? '❌ Деактивировать' : '✅ Активировать'),
          delete: '🗑 Удалить период',
          back: '🔙 Назад',
        },
        prompts: {
          add: 'Введите периоды в формате `дни:цена` (например, `30:199 90:499`):',
          duration: 'Введите новую длительность (в днях):',
          price: 'Введите новую цену (в рублях):',
        },
        success: {
          added: '✅ Период добавлен',
          updated: '✅ Период обновлен',
          toggled: (isActive: boolean) => `✅ Период ${isActive ? 'активирован' : 'деактивирован'}`,
          deleted: '✅ Период удалён',
        },
        errors: {
          notFound: '❌ Период не найден',
          invalidFormat: '❌ Неверный формат. Используйте: `дни:цена`',
          invalidNumber: '❌ Значение должно быть числом',
          duplicate: '❌ Период с такой длительностью уже существует',
          updateError: '❌ Ошибка при обновлении',
        },
      },
      create: {
        title: '➕ **Создание тарифа**',
        prompts: {
          name: 'Введите название тарифа:',
          description: 'Введите описание тарифа (или нажмите "Пропустить"):',
          traffic: 'Введите лимит трафика (в GB):',
          bypass: 'Введите лимит обхода блокировок (в GB):',
          devices: 'Введите количество устройств:',
          periods: 'Введите периоды в формате `дни:цена` (например, `30:199 90:499`):',
        },
        success: '✅ Тариф успешно создан!',
        creating: '⏳ Создаю тариф...',
      },
    },
    stats: {
      title: '📊 **Статистика**',
      inDevelopment: '🚧 Раздел в разработке...',
    },
    users: {
      title: '👥 **Управление пользователями**',
      inDevelopment: '🚧 Раздел в разработке...',
    },
  },

  // Ошибки
  errors: {
    sessionExpired: '❌ Сессия истекла. Начните сначала с /start',
    planNotFound: '❌ Тариф не найден',
    periodNotFound: '❌ Период не найден',
    apiError: '❌ Ошибка при обращении к серверу',
    unknown: '❌ Неизвестная ошибка',
  },
};

export type Locale = typeof ru;
