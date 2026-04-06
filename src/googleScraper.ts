import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConversionResult, ApiError } from './types';

// Add the stealth plugin
puppeteer.use(StealthPlugin());

export class GoogleCurrencyScraper {
  private static browser: Browser | null = null;
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  private async initializeBrowser(): Promise<void> {
    if (!GoogleCurrencyScraper.browser) {
      // Use puppeteer-extra to launch
      GoogleCurrencyScraper.browser = await (puppeteer as any).launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--lang=en-US,en;q=0.9',
          '--window-size=1920,1080'
        ]
      }) as Browser;
    }
  }

  async convertCurrency(
    from: string,
    to: string,
    amount: number
  ): Promise<ConversionResult> {
    // Strategy 1: Fast Scrape (Axios + Cheerio) via Google Finance
    try {
      const fastResult = await this.fastScrape(from, to, amount);
      if (fastResult) return fastResult;
    } catch (e) {
      // Silently fall back
    }

    // Strategy 2: Robust Scrape (Puppeteer + Stealth)
    return this.robustScrape(from, to, amount);
  }

  private async fastScrape(
    from: string,
    to: string,
    amount: number
  ): Promise<ConversionResult | null> {
    // Google Finance URL format: USD-INR
    const url = `https://www.google.com/finance/quote/${from.toUpperCase()}-${to.toUpperCase()}?hl=en`;
    
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': this.userAgent,
        'Accept-Language': 'en-US,en;q=0.9'
      },
      responseType: 'text',
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Google Finance specific selector
    const priceSelector = 'div.YMlKec.fxKbKc';
    const priceEl = $(priceSelector);

    if (priceEl.length > 0) {
      const priceText = priceEl.first().text();
      const rate = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (!isNaN(rate)) {
        return {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          amount,
          result: rate * amount,
          rate: rate,
          timestamp: new Date(),
          source: 'google',
          metadata: { method: 'fast_finance', selector: priceSelector, precision: 'high' }
        };
      }
    }

    return null;
  }

  private async robustScrape(
    from: string,
    to: string,
    amount: number
  ): Promise<ConversionResult> {
    let page: Page | undefined;
    const url = `https://www.google.com/finance/quote/${from.toUpperCase()}-${to.toUpperCase()}?hl=en`;
    const attemptedMethods: string[] = ['stealth_finance'];

    try {
      await this.initializeBrowser();
      page = await GoogleCurrencyScraper.browser!.newPage();
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1280, height: 800 });
      
      // Wait for the main price element
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

      const priceData = await page.evaluate(() => {
        const priceEl = document.querySelector('div.YMlKec.fxKbKc');
        return priceEl ? priceEl.textContent : null;
      });

      if (!priceData) {
        throw new Error('Could not find price data on Google Finance');
      }

      const rate = parseFloat(priceData.replace(/[^0-9.]/g, ''));
      if (isNaN(rate)) {
        throw new Error(`Invalid price data found: ${priceData}`);
      }

      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: rate * amount,
        rate: rate,
        timestamp: new Date(),
        source: 'google',
        metadata: { method: 'robust_finance', precision: 'high' }
      };

    } catch (error) {
      let htmlSnippet = '';
      if (page) {
        try {
          htmlSnippet = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
        } catch (e) {
          // Ignore snippet extraction errors
        }
      }
      throw {
        message: error instanceof Error ? error.message : String(error),
        code: 'GOOGLE_EXTRACT_ERROR',
        source: 'google',
        debugInfo: { url, htmlSnippet, methodAttempted: attemptedMethods }
      } as ApiError;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async close(): Promise<void> {
    if (GoogleCurrencyScraper.browser) {
      await GoogleCurrencyScraper.browser.close();
      GoogleCurrencyScraper.browser = null;
    }
  }
}
