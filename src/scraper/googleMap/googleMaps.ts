import { chromium } from 'playwright';
import { PlaceData } from '../../types';
import { scrapeEmailsFromWebsite } from './websiteScraper';

export async function scrapeGoogleMaps(searchQuery: string): Promise<PlaceData[]> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.google.com/maps');
    await page.waitForSelector('#searchboxinput');

    await page.fill('#searchboxinput', searchQuery);
    await page.keyboard.press('Enter');

    // Wait for results to load
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 }).catch(() => {
        console.log("Feed not found, might be a single result or different layout.");
    });
    
    await page.waitForTimeout(3000);

    const places: PlaceData[] = [];
    
    const feed = await page.$('div[role="feed"]');
    if(feed){
        // Scroll to load more results
        // Scroll to load more results
        let lastHeight = await page.evaluate((feedDiv) => feedDiv.scrollHeight, feed);
        let noChangeCount = 0;

        while (true) {
            await page.evaluate((feedDiv) => feedDiv.scrollTop += feedDiv.scrollHeight, feed);
            await page.waitForTimeout(2000);
            
            const newHeight = await page.evaluate((feedDiv) => feedDiv.scrollHeight, feed);
            if (newHeight === lastHeight) {
                noChangeCount++;
                if (noChangeCount >= 3) {
                    console.log("Reached end of list or no more items loading.");
                    break;
                }
                console.log("No new items loaded, retrying...");
            } else {
                noChangeCount = 0;
                lastHeight = newHeight;
                // Optional: Check if "You've reached the end of the list" is visible
                const endOfList = await page.$('span:has-text("You\'ve reached the end of the list")');
                if (endOfList) {
                    console.log("End of list detected.");
                    break;
                }
            }
        }
        
        // Get all items first
        const items = await feed.$$('div[role="article"]');
        console.log(`Found ${items.length} items. Processing...`);

        // We need to iterate carefully. Clicking an item might change the view.
        // Strategy: 
        // 1. Collect all aria-labels or unique identifiers first if possible.
        // 2. Or, click one, scrape, go back.
        // Going back in Maps can be tricky. 
        // Better Strategy for stability:
        // Iterate through the list. For each item:
        // - Click it.
        // - Wait for details panel.
        // - Extract Phone and Website.
        // - If website, call scrapeEmailsFromWebsite.
        // - Click "Back to results" or find the close button for the details.
        
        // Note: The list of items might become stale if we navigate away or the DOM updates.
        // We will try to click by index if possible, but selectors are dynamic.
        
        // Let's try a simpler approach first: Extract what is visible on the card.
        // Phone and Website are usually NOT on the card in the list view. They require a click.
        
        // Collect all URLs first
        const allItems = await feed.$$('div[role="article"]');
        console.log(`Found ${allItems.length} items. Collecting URLs...`);
        
        const placeUrls: string[] = [];
        for (const item of allItems) {
            const anchor = await item.$('a');
            if (anchor) {
                const href = await anchor.getAttribute('href');
                if (href) placeUrls.push(href);
            }
        }
        console.log(`Collected ${placeUrls.length} URLs. Starting detailed scraping...`);

        // Close the main search page to save resources, or keep it open if needed. 
        // We can close it since we have the URLs.
        await page.close();

        // Process URLs
        for (const url of placeUrls) {
             console.log(`Processing URL: ${url}`);
             const newPage = await context.newPage();
             
             try {
                 await newPage.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
                 
                 // Extract Name (from h1)
                 let name = '';
                 try {
                     const h1 = await newPage.$('h1');
                     if(h1) name = await h1.innerText();
                 } catch(e) { console.log("Error extracting name"); }
                 
                 if(!name) {
                     console.log("Could not find name, skipping.");
                     await newPage.close();
                     continue;
                 }
                 
                 // Extract Phone
                 let phone: string | undefined;
                 try {
                     const buttons = await newPage.$$('button');
                     for(const btn of buttons){
                         const label = await btn.getAttribute('aria-label');
                         if(label && label.includes('Phone:')){
                             phone = label.replace('Phone: ', '').trim();
                             break;
                         }
                     }
                 } catch(e) { console.log("Error extracting phone"); }

                 // Extract Website
                 let website: string | undefined;
                 try {
                     const anchors = await newPage.$$('a');
                     for(const a of anchors){
                         const label = await a.getAttribute('aria-label');
                         if(label && (label.includes('Website') || label.includes('website'))){
                             website = await a.getAttribute('href') || undefined;
                             break;
                         }
                     }
                 } catch(e) { console.log("Error extracting website"); }
                 
                 let emails: string[] = [];
                 if (website) {
                     console.log(`Found website: ${website}`);
                     emails = await scrapeEmailsFromWebsite(website);
                 }

                 places.push({
                     name,
                     phone,
                     website,
                     email: emails,
                     address: "Address extraction requires more specific selectors"
                 });

             } catch(e) {
                 console.log(`Error processing ${url}: ${e}`);
             } finally {
                 await newPage.close();
             }
        }
    } else {
        console.log("Could not find the results feed.");
    }

    return places;

  } catch (error) {
    console.error('Error scraping Google Maps:', error);
    return [];
  } finally {
    await browser.close();
  }
}
