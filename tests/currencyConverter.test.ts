import { CurrencyConverter, convertCurrency, defaultConverter } from '../src/currencyConverter';
import { GoogleCurrencyScraper } from '../src/googleScraper';
import { YahooCurrencyScraper } from '../src/yahooScraper';

// Mock the classes
jest.mock('../src/googleScraper');
jest.mock('../src/yahooScraper');

describe('CurrencyConverter', () => {
  let converter: CurrencyConverter;
  
  // Get handles to the prototype mocks
  const mockGoogleConvert = GoogleCurrencyScraper.prototype.convertCurrency as jest.Mock;
  const mockGoogleClose = GoogleCurrencyScraper.prototype.close as jest.Mock;
  const mockYahooConvert = YahooCurrencyScraper.prototype.convertCurrency as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    converter = new CurrencyConverter();
  });

  afterAll(async () => {
    await converter.close();
    await defaultConverter.close();
  });

  test('should return 1 when currencies are the same', async () => {
    const result = await converter.convert('USD', 'USD', { amount: 100 });
    expect(result.rate).toBe(1);
    expect(result.result).toBe(100);
    expect(mockGoogleConvert).not.toHaveBeenCalled();
  });

  test('should check cache first', async () => {
    mockGoogleConvert.mockResolvedValue({
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
    expect(mockGoogleConvert).toHaveBeenCalledTimes(1);

    // Second call - should hit cache
    await converter.convert('USD', 'EUR');
    expect(mockGoogleConvert).toHaveBeenCalledTimes(1);
  });

  test('should fail over to yahoo when google fails', async () => {
    mockGoogleConvert.mockRejectedValue(new Error('Google Failure'));
    mockYahooConvert.mockResolvedValue({
      from: 'USD',
      to: 'EUR',
      amount: 1,
      result: 0.84,
      rate: 0.84,
      timestamp: new Date(),
      source: 'fallback'
    });

    const result = await converter.convert('USD', 'EUR');

    expect(result.rate).toBe(0.84);
    expect(result.source).toBe('fallback');
    expect(mockGoogleConvert).toHaveBeenCalled();
    expect(mockYahooConvert).toHaveBeenCalled();
  });

  test('should handle validation of currency codes', async () => {
    await expect(converter.convert('INVALID', 'USD')).rejects.toThrow('Invalid currency code');
  });

  test('should use convenience function convertCurrency', async () => {
    mockGoogleConvert.mockResolvedValueOnce({
      from: 'GBP',
      to: 'USD',
      amount: 10,
      result: 13,
      rate: 1.3,
      timestamp: new Date(),
      source: 'google'
    });

    const result = await convertCurrency('GBP', 'USD', 10);
    expect(result.rate).toBe(1.3);
  });

  test('should throw error when all sources fail', async () => {
    mockGoogleConvert.mockRejectedValue(new Error('Google Down'));
    mockYahooConvert.mockRejectedValue(new Error('Yahoo Down'));

    await expect(converter.convert('USD', 'EUR')).rejects.toThrow('Yahoo Down');
  });

  test('should close the scraper', async () => {
    await converter.close();
    expect(mockGoogleClose).toHaveBeenCalled();
  });
});
