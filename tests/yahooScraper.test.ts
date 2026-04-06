import axios from 'axios';
import { YahooCurrencyScraper } from '../src/yahooScraper';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('YahooCurrencyScraper', () => {
  let scraper: YahooCurrencyScraper;

  beforeEach(() => {
    scraper = new YahooCurrencyScraper();
    jest.clearAllMocks();
  });

  test('should successfully fetch exchange rate from Yahoo API', async () => {
    const mockResponse = {
      data: {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 0.85,
                symbol: 'USDEUR=X'
              }
            }
          ]
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await scraper.convertCurrency('USD', 'EUR', 100);

    expect(result.rate).toBe(0.85);
    expect(result.result).toBe(85);
    expect(result.source).toBe('fallback');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('USDEUR=X'),
      expect.any(Object)
    );
  });

  test('should handle completely empty response from Yahoo API', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      code: 'YAHOO_API_ERROR'
    });
  });

  test('should throw error when Yahoo API returns invalid data', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { chart: { result: [] } } });

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      code: 'YAHOO_API_ERROR'
    });
  });

  test('should handle network errors from Yahoo API', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      code: 'YAHOO_API_ERROR'
    });
  });
});
