import { chromium, Page } from 'playwright';

export async function scrapeEmailsFromWebsite(url: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const emails: Set<string> = new Set();

  try {
    console.log(`Visiting ${url} to find emails...`);
    await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });

    // Helper to extract emails from text
    const extractEmails = (text: string) => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailRegex);
      if (matches) {
        matches.forEach(email => emails.add(email));
      }
    };

    // 1. Scrape current page content
    const content = await page.content();
    extractEmails(content);

    // 2. Look for "Contact" or "About" links
    const contactLinks = await page.$$eval('a', (anchors) => 
      anchors
        .map(a => ({ href: a.href, text: a.innerText.toLowerCase() }))
        .filter(link => link.text.includes('contact') || link.text.includes('about'))
        .map(link => link.href)
    );

    // Visit up to 2 contact pages
    for (const link of contactLinks.slice(0, 2)) {
        if(link && link.startsWith('http')){
            try {
                console.log(`Visiting contact page: ${link}`);
                await page.goto(link, { timeout: 10000, waitUntil: 'domcontentloaded' });
                const contactContent = await page.content();
                extractEmails(contactContent);
            } catch (e) {
                console.log(`Failed to visit ${link}`);
            }
        }
    }

  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);
  } finally {
    await browser.close();
  }

  return Array.from(emails);
}
