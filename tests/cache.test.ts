import { ExchangeRateCache } from '../src/cache';

describe('ExchangeRateCache', () => {
  let cache: ExchangeRateCache;

  beforeEach(() => {
    cache = new ExchangeRateCache(1); // 1 second TTL for testing
  });

  test('should set and get values', () => {
    cache.set('USD', 'EUR', 0.85);
    expect(cache.get('USD', 'EUR')).toBe(0.85);
  });

  test('should return null for non-existent keys', () => {
    expect(cache.get('GBP', 'JPY')).toBeNull();
  });

  test('should expire entries after TTL', () => {
    jest.useFakeTimers();
    cache.set('USD', 'EUR', 0.85);
    expect(cache.get('USD', 'EUR')).toBe(0.85);

    jest.advanceTimersByTime(1100);
    expect(cache.get('USD', 'EUR')).toBeNull();
    jest.useRealTimers();
  });

  test('should handle case insensitivity', () => {
    cache.set('usd', 'eur', 0.85);
    expect(cache.get('USD', 'EUR')).toBe(0.85);
  });

  test('should clear accurately', () => {
    cache.set('USD', 'EUR', 0.85);
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
