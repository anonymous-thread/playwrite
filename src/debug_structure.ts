import { chromium } from 'playwright';

async function debugStructure() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps');
  await page.fill('#searchboxinput', 'Dentist in San Francisco');
  await page.keyboard.press('Enter');
  await page.waitForSelector('div[role="feed"]');
  await page.waitForTimeout(2000);

  const feed = await page.$('div[role="feed"]');
  if (feed) {
    const items = await feed.$$('div[role="article"]');
    if (items.length > 0) {
      const html = await items[0].innerHTML();
      console.log('Item HTML:', html);
      
      // Check for anchor tag
      const anchor = await items[0].$('a');
      if (anchor) {
          const href = await anchor.getAttribute('href');
          console.log('Found href:', href);
      } else {
          console.log('No anchor tag found in item.');
      }
    }
  }
  await browser.close();
}

debugStructure();
