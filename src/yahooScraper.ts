import axios from 'axios';
import { ConversionResult, ApiError } from './types';

export class YahooCurrencyScraper {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async convertCurrency(
    from: string,
    to: string,
    amount: number
  ): Promise<ConversionResult> {
    const symbol = `${from.toUpperCase()}${to.toUpperCase()}=X`;
    // Using the internal Chart API for clean JSON and small headers
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

    try {
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com/'
        },
        responseType: 'json',
        timeout: 10000
      });

      const data = response.data;
      const result = data?.chart?.result?.[0];
      
      if (!result || !result.meta || typeof result.meta.regularMarketPrice !== 'number') {
        throw new Error(`Could not find price data in Yahoo API response for ${symbol}`);
      }

      const rate = result.meta.regularMarketPrice;

      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: rate * amount,
        rate: rate,
        timestamp: new Date(),
        source: 'fallback',
        metadata: { 
          method: 'yahoo_api', 
          precision: 'high',
          symbol: result.meta.symbol
        }
      };

    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Yahoo Finance API failed',
        code: 'YAHOO_API_ERROR',
        source: 'fallback'
      } as ApiError;
    }
  }
}
