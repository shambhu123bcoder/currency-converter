import { convertCurrency, formatCurrency } from '../src/index';

async function simpleIntegrationDemo() {
  console.log('--- Simple Integration Demo ---');
  console.log('Converting 100 USD to EUR using a single function call...\n');

  try {
    // No need to create a class or close anything - handled automatically!
    const result = await convertCurrency('USD', 'JPY', 100);

    console.log(`Success!`);
    console.log(`Amount: ${formatCurrency(result.amount, result.from)}`);
    console.log(`Result: ${formatCurrency(result.result, result.to)}`);
    console.log(`Rate: ${result.rate}`);
    console.log(`Source: ${result.source}`);
    console.log(`Timestamp: ${result.timestamp}`);

  } catch (error: any) {
    console.error('Error during conversion:', error.message);
    if (error.debugInfo) {
      console.log('\n--- Debug Info ---');
      console.log('URL Attempted:', error.debugInfo.url);
      console.log('Methods Attempted:', error.debugInfo.methodAttempted?.join(', ') || 'None');
      console.log('HTML Snippet:', error.debugInfo.htmlSnippet);
    }
  }
}

// Run the demo
simpleIntegrationDemo();
