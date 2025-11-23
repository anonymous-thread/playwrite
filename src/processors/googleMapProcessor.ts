import { IProcessor, Processor } from './registry';
import { scrapeGoogleMaps } from '../scraper/googleMap/googleMaps';
import { writeToCsv } from '../utils/csvWriter';

@Processor('googlemap')
export class GoogleMapProcessor implements IProcessor {
  async run(options: Record<string, any>): Promise<void> {
    const query = options.query;
    if (!query) {
      console.error('Error: "query" option is required for googlemap processor.');
      return;
    }

    console.log(`Starting Google Maps scraper for query: "${query}"...`);
    try {
      const data = await scrapeGoogleMaps(query);
      
      if (data.length > 0) {
        console.log(`Found ${data.length} places.`);
        await writeToCsv(data, 'output.csv');
      } else {
        console.log('No places found.');
      }
    } catch (error) {
      console.error('An error occurred during scraping:', error);
    }
  }
}
