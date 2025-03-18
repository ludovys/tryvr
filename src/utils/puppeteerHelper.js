/**
 * Puppeteer Helper Utility
 * 
 * Provides standardized methods for browser automation tasks
 * Configured to work in headless environments without requiring Xvfb
 */

import puppeteer from 'puppeteer';

/**
 * Launch a Puppeteer browser instance optimized for headless environments
 */
export async function launchBrowser() {
  return await puppeteer.launch({
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
}

/**
 * Navigate to a URL and return the page
 */
export async function navigateTo(url, browser = null) {
  const needToCloseBrowser = !browser;
  browser = browser || await launchBrowser();
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  return { page, browser, needToCloseBrowser };
}

/**
 * Take a screenshot of a page or element
 */
export async function takeScreenshot(options = {}) {
  const { url, selector, outputPath = 'screenshot.png', width = 1280, height = 800 } = options;
  
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    if (selector) {
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({ path: outputPath });
      } else {
        throw new Error(`Element with selector "${selector}" not found`);
      }
    } else {
      await page.screenshot({ path: outputPath });
    }
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Fill out a form
 */
export async function fillForm(url, formData, submitSelector, browser = null) {
  const { page, browser: createdBrowser, needToCloseBrowser } = await navigateTo(url, browser);
  
  try {
    // Fill each form field
    for (const [selector, value] of Object.entries(formData)) {
      await page.waitForSelector(selector);
      await page.type(selector, value);
    }
    
    // Submit the form if a submit selector is provided
    if (submitSelector) {
      await page.waitForSelector(submitSelector);
      await page.click(submitSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    return page;
  } finally {
    if (needToCloseBrowser) {
      await createdBrowser.close();
    }
  }
}

/**
 * Extract content from a page
 */
export async function extractContent(url, extractors, browser = null) {
  const { page, browser: createdBrowser, needToCloseBrowser } = await navigateTo(url, browser);
  
  try {
    const results = {};
    
    for (const [key, extractor] of Object.entries(extractors)) {
      if (typeof extractor === 'string') {
        // Simple selector-based extraction
        await page.waitForSelector(extractor, { timeout: 5000 }).catch(() => {});
        results[key] = await page.$eval(extractor, el => el.textContent?.trim())
          .catch(() => null);
      } else if (typeof extractor === 'function') {
        // Custom extraction function
        results[key] = await extractor(page);
      }
    }
    
    return results;
  } finally {
    if (needToCloseBrowser) {
      await createdBrowser.close();
    }
  }
}

/**
 * Evaluate JavaScript in the context of the page
 */
export async function evaluateOnPage(url, script, browser = null) {
  const { page, browser: createdBrowser, needToCloseBrowser } = await navigateTo(url, browser);
  
  try {
    return await page.evaluate(script);
  } finally {
    if (needToCloseBrowser) {
      await createdBrowser.close();
    }
  }
}

export default {
  launchBrowser,
  navigateTo,
  takeScreenshot,
  fillForm,
  extractContent,
  evaluateOnPage
}; 