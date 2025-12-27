// Типы для работы с API

export interface VPNPlan {
  id: string;
  name: string;
  description: string | null;
  defaultTrafficLimitGB: number;
  defaultBypassTrafficLimitGB: number;
  defaultDeviceLimit: number;
  bypassTrafficEnabled: boolean;
  isActive: boolean;
  periods: PlanPeriod[];
  extraTraffic: PlanExtraTraffic[];
  extraBypassTraffic: PlanExtraBypassTraffic[];
  extraDevices: PlanExtraDevice[];
}

export interface PlanPeriod {
  id: string;
  planId: string;
  durationDays: number;
  price: string;
  isActive: boolean;
}

export interface PlanExtraTraffic {
  id: string;
  planId: string;
  trafficGB: number;
  price: string;
  isActive: boolean;
}

export interface PlanExtraBypassTraffic {
  id: string;
  planId: string;
  bypassTrafficGB: number;
  price: string;
  isActive: boolean;
}

export interface PlanExtraDevice {
  id: string;
  planId: string;
  deviceCount: number;
  price: string;
  isActive: boolean;
}
