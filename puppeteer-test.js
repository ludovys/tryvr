import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  console.log('Browser launched successfully!');
  console.log('Opening a new page...');
  
  const page = await browser.newPage();
  console.log('Navigating to example.com...');
  
  await page.goto('https://example.com');
  console.log('Page loaded successfully!');
  
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  const content = await page.content();
  console.log('Page content length:', content.length);
  
  // Take a screenshot
  console.log('Taking screenshot...');
  await page.screenshot({path: 'example.png'});
  console.log('Screenshot saved as example.png');
  
  // Close browser
  console.log('Closing browser...');
  await browser.close();
  console.log('Test completed successfully!');
})().catch(err => {
  console.error('Error occurred during test:');
  console.error(err);
  process.exit(1);
}); 