import { scrapeGoogleMaps } from './scraper/googleMaps';
import { writeToCsv } from './utils/csvWriter';

async function main() {
  const searchQuery = process.argv[2];

  if (!searchQuery) {
    console.error('Please provide a search query as an argument.');
    console.error('Usage: npm run dev "Search Query"');
    process.exit(1);
  }

  console.log(`Starting scraper for query: "${searchQuery}"...`);

  try {
    const data = await scrapeGoogleMaps(searchQuery);
    
    if (data.length > 0) {
      console.log(`Found ${data.length} places.`);
      await writeToCsv(data, 'output.csv');
    } else {
      console.log('No places found.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
