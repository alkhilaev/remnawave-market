export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELED';

export interface Subscription {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  trafficLimitGB: number;
  bypassTrafficLimitGB: number;
  deviceLimit: number;
  durationDays: number;
  startDate: string;
  expiryDate: string;
  autoRenewal: boolean;
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Активна',
  EXPIRED: 'Истекла',
  SUSPENDED: 'Приостановлена',
  CANCELED: 'Отменена',
};

export const statusColors: Record<SubscriptionStatus, string> = {
  ACTIVE: 'text-green-500',
  EXPIRED: 'text-red-500',
  SUSPENDED: 'text-yellow-500',
  CANCELED: 'text-muted-foreground',
};
