export type Currency = 'EUR' | 'USD' | 'JPY' | 'CHF';
export type Frequency = 'weekly' | 'monthly' | 'bimonthly' | 'yearly';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  preferredCurrency: Currency;
  createdAt?: any; // Firestore Timestamp
}

export interface Subscription {
  id?: string;
  userId: string;
  name: string;
  price: number;
  currency: Currency;
  frequency: Frequency;
  nextPaymentDate: Date | string; // Date object or ISO string or Timestamp
  category: string;
  lastUsed?: Date | string;
  status: 'active' | 'cancelled';
  logo?: string;
  icon?: string;
  color?: string;
  comments?: string;
}
