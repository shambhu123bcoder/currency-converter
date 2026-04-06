export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class ExchangeRateCache {
  private cache: Map<string, CacheEntry<number>> = new Map();
  private readonly defaultTtl: number;

  constructor(defaultTtlSeconds: number = 3600) { // Default 1 hour
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  set(from: string, to: string, rate: number, ttlSeconds?: number): void {
    const key = this.generateKey(from, to);
    const ttl = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
    const entry: CacheEntry<number> = {
      data: rate,
      expiry: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }

  get(from: string, to: string): number | null {
    const key = this.generateKey(from, to);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private generateKey(from: string, to: string): string {
    return `${from.toUpperCase()}_${to.toUpperCase()}`;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
