export interface BusinessProfile {
  name: string;
  legalName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRate: number;
  timezone: string;
  logoUrl?: string;
}

export interface DaySchedule {
  day: string;
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface QRSettings {
  tableCount: number;
  allowSelfOrdering: boolean;
  requireTableNumber: boolean;
  serviceTaxPercentage: number;
  wifiName: string;
  wifiPassword?: string;
}
