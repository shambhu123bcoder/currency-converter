import dotenv from 'dotenv';
import { GoogleCurrencyScraper } from './googleScraper';
import { YahooCurrencyScraper } from './yahooScraper';
import { ExchangeRateCache } from './cache';
import {
  ConversionResult,
  ConversionOptions,
  ApiError,
  CurrencyCode
} from './types';

// Load environment variables
dotenv.config();

export class CurrencyConverter {
  private googleScraper: GoogleCurrencyScraper;
  private yahooScraper: YahooCurrencyScraper;
  private cache: ExchangeRateCache;

  constructor() {
    this.googleScraper = new GoogleCurrencyScraper();
    this.yahooScraper = new YahooCurrencyScraper();
    this.cache = new ExchangeRateCache();
  }

  async convert(
    from: CurrencyCode,
    to: CurrencyCode,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    const { amount = 1, timeout = 45000, source = 'auto' } = options;

    if (from.length !== 3 || to.length !== 3) {
      throw new Error('Invalid currency code');
    }

    if (from.toUpperCase() === to.toUpperCase()) {
      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: amount,
        rate: 1,
        timestamp: new Date(),
        source: 'google'
      };
    }

    // Check Cache first
    const cachedRate = this.cache.get(from, to);
    if (cachedRate !== null) {
      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: amount * cachedRate,
        rate: cachedRate,
        timestamp: new Date(),
        source: 'google',
        metadata: { method: 'cache' }
      };
    }

    // Conversion with timeout
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Conversion timeout')), timeout);
    });

    try {
      const result = await Promise.race<ConversionResult>([
        this.performConversion(from, to, amount, source),
        timeoutPromise
      ]);

      // Save to cache on success
      if (result && result.rate) {
        this.cache.set(from, to, result.rate);
      }

      return result;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async performConversion(
    from: CurrencyCode,
    to: CurrencyCode,
    amount: number,
    source: string
  ): Promise<ConversionResult> {
    const sources = this.getConversionOrder(source);
    let lastError: any = null;

    for (const s of sources) {
      try {
        if (s === 'google') {
          return await this.googleScraper.convertCurrency(from, to, amount);
        } else if (s === 'yahoo' || s === 'fallback') {
          return await this.yahooScraper.convertCurrency(from, to, amount);
        }
      } catch (error) {
        lastError = error;
        console.warn(`Source ${s} failed:`, (error as any).message);
        // Continue to next source
      }
    }

    throw lastError || new Error('All conversion sources failed');
  }

  private getConversionOrder(preferredSource: string): string[] {
    if (preferredSource === 'google') return ['google', 'yahoo'];

    // Default automation order: Google first, then Yahoo backup
    return ['google', 'yahoo'];
  }

  async close(): Promise<void> {
    await this.googleScraper.close();
  }
}

// Global shared instance for seamless integration
export const defaultConverter = new CurrencyConverter();

// Auto-cleanup on process exit
process.on('SIGINT', () => {
  defaultConverter.close().then(() => process.exit(0)).catch(() => process.exit(1));
});

process.on('SIGTERM', () => {
  defaultConverter.close().then(() => process.exit(0)).catch(() => process.exit(1));
});

// Convenience function
export async function convertCurrency(
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number = 1,
  options?: ConversionOptions
): Promise<ConversionResult> {
  return defaultConverter.convert(from, to, { amount, ...options });
}
