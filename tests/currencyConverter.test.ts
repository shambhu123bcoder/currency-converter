import { CurrencyConverter } from '../src/currencyConverter';
import { GoogleCurrencyScraper } from '../src/googleScraper';

jest.mock('../src/googleScraper');

describe('CurrencyConverter', () => {
  let converter: CurrencyConverter;
  const mockScraper = {
    convertCurrency: jest.fn(),
    close: jest.fn()
  };

  beforeEach(() => {
    (GoogleCurrencyScraper as unknown as jest.Mock).mockImplementation(() => mockScraper);
    converter = new CurrencyConverter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await converter.close();
  });

  test('should return 1 when currencies are the same', async () => {
    const result = await converter.convert('USD', 'USD', { amount: 100 });
    expect(result.rate).toBe(1);
    expect(result.result).toBe(100);
    expect(mockScraper.convertCurrency).not.toHaveBeenCalled();
  });

  test('should check cache first', async () => {
    // Set mock for first call
    mockScraper.convertCurrency.mockResolvedValue({
      from: 'USD',
      to: 'EUR',
      amount: 1,
      result: 0.85,
      rate: 0.85,
      timestamp: new Date(),
      source: 'google'
    });

    // First call - should hit scraper
    await converter.convert('USD', 'EUR');
    expect(mockScraper.convertCurrency).toHaveBeenCalledTimes(1);

    // Second call - should hit cache
    await converter.convert('USD', 'EUR');
    expect(mockScraper.convertCurrency).toHaveBeenCalledTimes(1);
  });

  test('should handle validation of currency codes', async () => {
    await expect(converter.convert('INVALID', 'USD')).rejects.toThrow('Invalid currency code');
  });

  test('should close the scraper', async () => {
    await converter.close();
    expect(mockScraper.close).toHaveBeenCalledTimes(1);
  });
});
