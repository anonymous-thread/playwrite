import { IProcessor, Processor } from './registry';
import { scrapeGoogleMaps } from '../scraper/googleMap/googleMaps';
import { writeToCsv } from '../utils/csvWriter';
import { getGoogleSheetsData } from '../controllers/googleSheetsController';
import { googleMapConfig } from '../config/googleMap.config';

interface QueryData {
  pincode: string;
  query: string;
}

function createQuery(queryData: QueryData[]): string[] {
  const queries = queryData.map((val) => {
    return `${val.query} near ${val.pincode}`;
  });
  return queries;
}

@Processor('googlemap')
export class GoogleMapProcessor implements IProcessor {
  async run(options: Record<string, any>): Promise<void> {
    let queryArr: string[] = [];
    const query = options.query;
    const toNotSaveInFile = options.toNotSaveInFile && "false";
    
    if (!query) {
      console.log('Missing: "query" option is not given, moving forward with spreadsheet.');
      console.log('Fetching queries from spreadsheet...');
      const queryData = await getGoogleSheetsData(googleMapConfig.sheetUrl);
      console.log(`Starting processing for ${queryData.length} rows`);
      queryArr = createQuery(queryData);
    } else {
      queryArr = [query];
    }

    try {
      for (let i = 0; i < queryArr.length; i++) {
        const currentQuery = queryArr[i];
        console.log(`\n[${i + 1}/${queryArr.length}] Starting Google Maps scraper for query: "${currentQuery}"...`);
        
        const data = await scrapeGoogleMaps(currentQuery);
        
        if (data.length > 0 && toNotSaveInFile !== "true") {
          console.log(`Found ${data.length} places.`);
          const filename = queryArr.length > 1 
            ? `output-${i + 1}.csv` 
            : 'output.csv';
          await writeToCsv(data, filename);
        } else {
          console.log('No places found.');
        }
      }
      
      console.log(`\n✅ Completed processing ${queryArr.length} queries.`);
    } catch (error) {
      console.error('An error occurred during scraping:', error);
    }
  }
}
