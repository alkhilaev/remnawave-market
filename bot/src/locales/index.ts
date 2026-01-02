import { ru } from './ru';

// Экспорт локалей
export const locales = {
  ru,
};

// Текущая локаль (в будущем можно добавить выбор языка)
export const currentLocale = locales.ru;

// Короткий алиас для удобства использования
export const t = currentLocale;

// Экспорт типа
export type { Locale } from './ru';
