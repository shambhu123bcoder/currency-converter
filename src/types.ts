export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: Date;
  source: 'google' | 'exchangerate-api' | 'fixer' | 'currencylayer' | 'fallback';
  metadata?: {
    method?: string;
    selector?: string;
    precision?: 'high' | 'standard';
    symbol?: string;
  };
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export interface ConversionOptions {
  amount?: number;
  timeout?: number;
  retries?: number;
  source?: 'google' | 'exchangerate-api' | 'fixer' | 'auto';
}

export interface ApiError {
  message: string;
  code: string;
  source: string;
  debugInfo?: {
    url?: string;
    htmlSnippet?: string;
    methodAttempted?: string[];
  };
}

export type CurrencyCode = keyof PopularCurrencies | (string & {});

export interface PopularCurrencies {
  // --- G10 & Global Reserve ---
  USD: 'US Dollar';
  EUR: 'Euro';
  GBP: 'British Pound';
  JPY: 'Japanese Yen';
  AUD: 'Australian Dollar';
  CAD: 'Canadian Dollar';
  CHF: 'Swiss Franc';
  CNY: 'Chinese Yuan';
  INR: 'Indian Rupee';
  NZD: 'New Zealand Dollar';

  // --- Europe (Active 2026) ---
  SEK: 'Swedish Krona';
  NOK: 'Norwegian Krone';
  DKK: 'Danish Krone';
  PLN: 'Polish Zloty';
  CZK: 'Czech Koruna';
  HUF: 'Hungarian Forint';
  RON: 'Romanian Leu';
  RSD: 'Serbian Dinar';
  ALL: 'Albanian Lek';
  MKD: 'Macedonian Denar';
  BAM: 'Bosnia-Herzegovina Convertible Mark';
  ISK: 'Icelandic Krona';
  UAH: 'Ukrainian Hryvnia';
  GEL: 'Georgian Lari';
  AMD: 'Armenian Dram';
  AZN: 'Azerbaijani Manat';
  TRY: 'Turkish Lira';
  RUB: 'Russian Ruble';

  // --- Asia & Pacific ---
  SGD: 'Singapore Dollar';
  HKD: 'Hong Kong Dollar';
  KRW: 'South Korean Won';
  TWD: 'New Taiwan Dollar';
  THB: 'Thai Baht';
  MYR: 'Malaysian Ringgit';
  IDR: 'Indonesian Rupiah';
  PHP: 'Philippine Peso';
  VND: 'Vietnamese Dong';
  PKR: 'Pakistani Rupee';
  BDT: 'Bangladeshi Taka';
  LKR: 'Sri Lankan Rupee';
  NPR: 'Nepalese Rupee';
  AED: 'UAE Dirham';
  SAR: 'Saudi Riyal';
  QAR: 'Qatari Riyal';
  KWD: 'Kuwaiti Dinar';
  BHD: 'Bahraini Dinar';
  OMR: 'Omani Rial';
  ILS: 'Israeli New Shekel';
  KZT: 'Kazakhstani Tenge';
  UZS: 'Uzbekistan Som';

  // --- Americas ---
  MXN: 'Mexican Peso';
  BRL: 'Brazilian Real';
  CLP: 'Chilean Peso';
  COP: 'Colombian Peso';
  ARS: 'Argentine Peso';
  UYU: 'Uruguayan Peso';
  PEN: 'Peruvian Sol';
  XCD: 'East Caribbean Dollar';
  XCG: 'Caribbean Guilder'; // New 2026 standard for Curaçao/Sint Maarten

  // --- Africa ---
  ZAR: 'South African Rand';
  EGP: 'Egyptian Pound';
  NGN: 'Nigerian Naira';
  KES: 'Kenyan Shilling';
  GHS: 'Ghanaian Cedi';
  MAD: 'Moroccan Dirham';
  DZD: 'Algerian Dinar';
  ZWG: 'Zimbabwe Gold'; // The official 2026 successor to ZWL
  ETB: 'Ethiopian Birr';
  TZS: 'Tanzanian Shilling';
  UGX: 'Ugandan Shilling';
  MUR: 'Mauritian Rupee';

  // --- Territorial & Niche ---
  GIP: 'Gibraltar Pound';
  JEP: 'Jersey Pound';
  IMP: 'Isle of Man Pound';
  FJD: 'Fijian Dollar';
  PGK: 'Papua New Guinean Kina';
}