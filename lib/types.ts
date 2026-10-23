export type ItemSize = {
  name: string;
  nameAr?: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  hot?: number;
  iced?: number;
  price?: number;
  sizes?: ItemSize[];
  description?: string;
  notes?: string;
  tag?: string;
  image?: string;
  active: boolean;
};

export type PaymentSettings = {
  stcEnabled: boolean;
  stcNumber: string;
  stcName: string;
  stcNote: string;
  barqEnabled: boolean;
  barqNumber: string;
  barqName: string;
  barqNote: string;
};

export const defaultPaymentSettings: PaymentSettings = {
  stcEnabled: true,
  stcNumber: '0511313965',
  stcName: 'Waseem Cafe - Captain Waseem',
  stcNote: 'Please enter your order name or mobile in the transfer description.',
  barqEnabled: true,
  barqNumber: '0511313965',
  barqName: 'Waseem Cafe - Captain Waseem',
  barqNote: 'Please enter your order name or mobile in the transfer description.',
};

export type CafeSettings = {
  storeOpen: boolean;
  adminPasscode: string;
  paymentSettings?: PaymentSettings;
};
