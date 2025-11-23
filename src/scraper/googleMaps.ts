import { chromium } from 'playwright';
import { PlaceData } from '../types';
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
        for(let i=0; i<5; i++){
            await page.evaluate((feedDiv) => feedDiv.scrollTop += feedDiv.scrollHeight, feed);
            await page.waitForTimeout(1000);
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
        
        // Re-query items in the loop to avoid stale elements
        for (let i = 0; i < items.length; i++) {
             // Re-select feed to ensure it's not stale
             const currentFeed = await page.$('div[role="feed"]');
             if(!currentFeed) {
                 console.log("Feed lost. Trying to find it again...");
                 await page.waitForSelector('div[role="feed"]', { timeout: 5000 }).catch(() => {});
             }
             const activeFeed = await page.$('div[role="feed"]');
             if(!activeFeed) break;

             const currentItems = await activeFeed.$$('div[role="article"]');
             if(i >= currentItems.length) break;
             
             const item = currentItems[i];
             const ariaLabel = await item.getAttribute('aria-label');
             if(!ariaLabel) continue;
             
             console.log(`Processing: ${ariaLabel}`);

             // Scroll item into view
             try {
                await item.scrollIntoViewIfNeeded();
                await item.click();
             } catch(e) {
                 console.log(`Error clicking item ${ariaLabel}: ${e}`);
                 continue;
             }
             
             // Wait for details to load. Look for a known element in details pane, e.g., the title or actions.
             try {
                 await page.waitForSelector(`h1:has-text("${ariaLabel}")`, { timeout: 5000 });
             } catch(e) {
                 console.log(`Could not open details for ${ariaLabel}`);
                 // Try to go back if we are stuck
                 const backBtn = await page.$('button[aria-label="Back"]');
                 if(backBtn) await backBtn.click();
                 continue;
             }
             
             // Extract Phone
             let phone: string | undefined;
             try {
                 const phoneBtn = await page.$('button[data-item-id^="phone:"]');
                 if(phoneBtn) {
                    const label = await phoneBtn.getAttribute('aria-label');
                    phone = label || undefined;
                    if(phone) phone = phone.replace('Phone: ', '').trim();
                 } else {
                     const buttons = await page.$$('button');
                     for(const btn of buttons){
                         const label = await btn.getAttribute('aria-label');
                         if(label && label.includes('Phone:')){
                             phone = label.replace('Phone: ', '').trim();
                             break;
                         }
                     }
                 }
             } catch(e) { console.log("Error extracting phone"); }

             // Extract Website
             let website: string | undefined;
             try {
                 const websiteBtn = await page.$('a[data-item-id="authority"]');
                 if(websiteBtn) {
                     website = await websiteBtn.getAttribute('href') || undefined;
                 } else {
                     const anchors = await page.$$('a');
                     for(const a of anchors){
                         const label = await a.getAttribute('aria-label');
                         if(label && (label.includes('Website') || label.includes('website'))){
                             website = await a.getAttribute('href') || undefined;
                             break;
                         }
                     }
                 }
             } catch(e) { console.log("Error extracting website"); }
             
             let emails: string[] = [];
             if (website) {
                 console.log(`Found website: ${website}`);
                 emails = await scrapeEmailsFromWebsite(website);
             }

             places.push({
                 name: ariaLabel,
                 phone,
                 website,
                 email: emails,
                 address: "Address extraction requires more specific selectors"
             });
             
             // Go back to list
             console.log("Going back to results...");
             await page.goBack();
             
             // Wait for list to reappear
             try {
                await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
             } catch(e) {
                 console.log("Feed not found after going back. Trying to reload...");
                 // If goBack failed, maybe we are still on the same page?
                 // Try to find the close button as backup
                 const closeBtn = await page.$('button[aria-label="Close"]');
                 if(closeBtn) await closeBtn.click();
             }
             await page.waitForTimeout(2000); 
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
