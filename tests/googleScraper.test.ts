import axios from 'axios';
import puppeteer from 'puppeteer-extra';
import { GoogleCurrencyScraper } from '../src/googleScraper';

jest.mock('axios');
jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedPuppeteer = puppeteer as any;

describe('GoogleCurrencyScraper', () => {
  let scraper: GoogleCurrencyScraper;

  beforeEach(() => {
    scraper = new GoogleCurrencyScraper();
    jest.clearAllMocks();
    // Clear static browser instance for test isolation
    (GoogleCurrencyScraper as any).browser = null;
  });

  afterAll(async () => {
    await scraper.close();
  });

  test('should successfully fetch rate using fastScrape (Cheerio)', async () => {
    const mockHtml = `
      <div class="YMlKec fxKbKc">0.85</div>
    `;
    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await scraper.convertCurrency('USD', 'EUR', 100);

    expect(result.rate).toBe(0.85);
    expect(result.result).toBe(85);
    expect(result.metadata?.method).toBe('fast_finance');
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  test('should fall back to robustScrape (Puppeteer) if fastScrape fails', async () => {
    // Fast scrape fails (no element)
    mockedAxios.get.mockResolvedValueOnce({ data: '<html><body>No price here</body></html>' });

    // Robust scrape mock
    const mockPage = {
      setUserAgent: jest.fn(),
      setViewport: jest.fn(),
      goto: jest.fn(),
      evaluate: jest.fn().mockResolvedValue('0.85'),
      close: jest.fn()
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn()
    };
    mockedPuppeteer.launch.mockResolvedValueOnce(mockBrowser);

    const result = await scraper.convertCurrency('USD', 'EUR', 100);

    expect(result.rate).toBe(0.85);
    expect(result.metadata?.method).toBe('robust_finance');
    expect(mockPage.goto).toHaveBeenCalledWith(
        expect.stringContaining('USD-EUR'),
        expect.any(Object)
    );
  });

  test('should throw error when both strategies fail', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Fast Fail'));
    
    const mockPage = {
        setUserAgent: jest.fn(),
        setViewport: jest.fn(),
        goto: jest.fn(),
        evaluate: jest.fn().mockResolvedValue(null), // Fail evaluation
        close: jest.fn()
    };
    const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
    };
    mockedPuppeteer.launch.mockResolvedValue(mockBrowser);

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      message: 'Could not find price data on Google Finance'
    });
  });

  test('should close the browser correctly', async () => {
    const mockBrowser = { close: jest.fn() };
    // Trigger initialization by setting the static property indirectly
    (GoogleCurrencyScraper as any).browser = mockBrowser;

    await scraper.close();

    expect(mockBrowser.close).toHaveBeenCalled();
    expect((GoogleCurrencyScraper as any).browser).toBeNull();
  });

  test('should handle non-Error objects in catch block', async () => {
    mockedAxios.get.mockRejectedValueOnce('String Error');
    // For robust scrape failure
    mockedPuppeteer.launch.mockRejectedValueOnce('Yahoo Down');

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      message: 'Yahoo Down'
    });
  });

  test('should throw error when robustScrape finds invalid non-numeric price', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: '<html><body>No price here</body></html>' });
    
    const mockPage = {
        setUserAgent: jest.fn(),
        setViewport: jest.fn(),
        goto: jest.fn(),
        evaluate: jest.fn().mockResolvedValue('Not a price'),
        close: jest.fn()
    };
    const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn()
    };
    mockedPuppeteer.launch.mockResolvedValue(mockBrowser);

    await expect(scraper.convertCurrency('USD', 'EUR', 100)).rejects.toMatchObject({
      message: expect.stringContaining('Invalid price data found')
    });
  });
});
