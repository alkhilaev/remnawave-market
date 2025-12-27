/**
 * Централизованные коды ошибок для API
 */
export const ERRORS = {
  // Ошибки авторизации
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Не авторизован',
    httpCode: 401,
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Неверный email или пароль',
    httpCode: 401,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Токен истёк',
    httpCode: 401,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Недействительный токен',
    httpCode: 401,
  },

  // Ошибки доступа
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Доступ запрещён',
    httpCode: 403,
  },
  FORBIDDEN_ROLE_ERROR: {
    code: 'FORBIDDEN_ROLE_ERROR',
    message: 'Недостаточно прав для выполнения операции',
    httpCode: 403,
  },

  // Ошибки пользователей
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'Пользователь не найден',
    httpCode: 404,
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'Пользователь с таким email уже существует',
    httpCode: 409,
  },

  // Ошибки тарифов
  PLAN_NOT_FOUND: {
    code: 'PLAN_NOT_FOUND',
    message: 'Тариф не найден',
    httpCode: 404,
  },
  INVALID_PERIOD: {
    code: 'INVALID_PERIOD',
    message: 'Некорректный период подписки',
    httpCode: 400,
  },

  // Ошибки подписок
  SUBSCRIPTION_NOT_FOUND: {
    code: 'SUBSCRIPTION_NOT_FOUND',
    message: 'Подписка не найдена',
    httpCode: 404,
  },
  SUBSCRIPTION_ALREADY_EXISTS: {
    code: 'SUBSCRIPTION_ALREADY_EXISTS',
    message: 'У пользователя уже есть активная подписка',
    httpCode: 409,
  },

  // Общие ошибки
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Внутренняя ошибка сервера',
    httpCode: 500,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Некорректный запрос',
    httpCode: 400,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Ошибка валидации данных',
    httpCode: 400,
  },
} as const;

export type ErrorCode = keyof typeof ERRORS;
