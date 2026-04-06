# Currency Converter Scraper

A robust, **100% free-of-cost** currency conversion library for Node.js. It uses advanced stealth scraping from Google Finance and high-precision fallbacks from Yahoo Finance to provide real-time exchange rates without requiring API keys or paid subscriptions.

## 🚀 Key Features

- 🛑 **Anti-Bot Stealth**: Uses `puppeteer-extra-plugin-stealth` to bypass Google's bot detection.
- 📈 **Google Finance First**: Targets the stable Google Finance UI for high-precision live rates.
- 🔄 **Automatic Failover**: Transparently switches to Yahoo Finance API if Google is blocked by captchas.
- ⚡ **Built-in Caching**: Internal 1-hour TTL cache to maximize performance and minimize network requests.
- 🔌 **Plug-and-Play**: Zero configuration required. Just import and convert.
- 📦 **Node.js 14+ Support**: Optimized for compatibility with older environments.

## 📦 Installation

```bash
npm install currency-converter-scraper
```

## 🎯 Quick Start

### CommonJS (CJS)
```javascript
const { convertCurrency } = require('currency-converter-scraper');

async function main() {
  const result = await convertCurrency('USD', 'EUR', 100);
  console.log(result.result);
}
```

### ESModules (ESM)
```javascript
import { convertCurrency } from 'currency-converter-scraper';

async function main() {
  const result = await convertCurrency('GBP', 'JPY', 50);
  console.log(result.result);
}
```

---

## 🛠️ Advanced Usage

### Custom Options
You can pass custom timeouts and preferred sources directly to `convertCurrency`.

```javascript
const result = await convertCurrency('USD', 'EUR', 100, { 
  timeout: 45000, // Custom 45s timeout
  source: 'google' // Choice: 'google' | 'yahoo' | 'auto'
});
```

### Result Object
Every conversion returns a detailed `ConversionResult`:
```json
{
  "from": "USD", "to": "EUR", "amount": 100,
  "result": 91.80, "rate": 0.9180,
  "source": "google",
  "metadata": { "method": "robust_finance", "precision": "high" }
}
```

## 🛡️ Reliability & Failover

This library is designed for production resilience. It attempts conversion in the following order:

1. **Local Cache**: Returns the rate immediately if retrieved in the last hour.
2. **Google Finance (Fast)**: Attempts a lightweight HTTP request for maximum speed.
3. **Google Finance (Stealth)**: Launches a headless browser with stealth plugins to mimic human behavior.
4. **Yahoo Finance API**: A surgical fallback that uses Yahoo's internal chart API if Google presents a captcha.

## 🔧 Dependencies

- `axios` - HTTP client for API requests and fast scraping
- `cheerio` - HTML parsing for lightweight extraction
- `puppeteer` - Headless browser for robust scraping
- `puppeteer-extra` - Enhanced wrapper (included)
- `puppeteer-extra-plugin-stealth` - Necessary for bypassing bot detection (included)

## 📜 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! If you find a selector has changed or a new free source is available, please feel free to submit a Pull Request.
