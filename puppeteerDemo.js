/**
 * Puppeteer Demo Script
 * 
 * This script demonstrates how to use the Puppeteer helper utilities
 * to perform various browser automation tasks without requiring an X server
 */

import puppeteerHelper from './utils/puppeteerHelper.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemonstration() {
  console.log('TryVR Puppeteer Demonstration');
  console.log('===========================');
  
  // 1. Take a screenshot of a website
  console.log('\n1. Taking a screenshot of example.com...');
  const screenshotPath = await puppeteerHelper.takeScreenshot({
    url: 'https://example.com',
    outputPath: path.join(__dirname, '../screenshots/example.png'),
    width: 1024,
    height: 768
  });
  console.log(`Screenshot saved to: ${screenshotPath}`);
  
  // 2. Extract content from a website
  console.log('\n2. Extracting content from example.com...');
  const content = await puppeteerHelper.extractContent('https://example.com', {
    title: 'h1',
    paragraph: 'p',
    links: async (page) => {
      return await page.$$eval('a', links => links.map(link => ({
        text: link.textContent,
        href: link.href
      })));
    }
  });
  console.log('Extracted content:');
  console.log(JSON.stringify(content, null, 2));
  
  // 3. Fill out a search form
  console.log('\n3. Performing a search on example.com (this will likely redirect)...');
  const browser = await puppeteerHelper.launchBrowser();
  try {
    const page = await puppeteerHelper.fillForm(
      'https://example.com',
      { 'input[type="search"]': 'Puppeteer testing' },
      'button[type="submit"]',
      browser
    );
    
    console.log(`Search completed. Current URL: ${page.url()}`);
  } catch (err) {
    console.log('Note: Example.com may not have a search form, this is just for demo purposes.');
    console.error(err.message);
  } finally {
    await browser.close();
  }
  
  // 4. Evaluate JavaScript on a page
  console.log('\n4. Evaluating JavaScript on a page...');
  const evalResult = await puppeteerHelper.evaluateOnPage('https://example.com', () => {
    // This code runs in the browser context
    return {
      title: document.title,
      url: location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  });
  console.log('Evaluation result:');
  console.log(JSON.stringify(evalResult, null, 2));
  
  console.log('\nDemonstration completed successfully!');
}

// Create screenshots directory if it doesn't exist
import fs from 'fs';
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Run the demonstration
runDemonstration().catch(err => {
  console.error('Error occurred during demonstration:');
  console.error(err);
}); 