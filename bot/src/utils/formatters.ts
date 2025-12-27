/**
 * Форматирование цены в рубли
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${numPrice.toFixed(0)} ₽`;
}

/**
 * Форматирование трафика в GB
 */
export function formatTraffic(gb: number): string {
  if (gb === 0) return 'Безлимит';
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  return `${gb} GB`;
}

/**
 * Форматирование периода подписки
 */
export function formatPeriod(days: number): string {
  if (days === 30) return '1 месяц';
  if (days === 90) return '3 месяца';
  if (days === 180) return '6 месяцев';
  if (days === 365) return '12 месяцев';
  if (days % 30 === 0) return `${days / 30} месяцев`;
  return `${days} дней`;
}

/**
 * Экранирование специальных символов для MarkdownV2
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
