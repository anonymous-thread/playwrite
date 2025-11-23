import { getGoogleSheetsData } from '../controllers/googleSheetsController';
import { writeToJson } from '../utils/jsonWriter';

async function testGoogleSheets() {
  const url = 'https://docs.google.com/spreadsheets/d/1L7FULMPPqUQwoT-0RNefeRAqNTHB_dtI22K-AovmXTc/edit?usp=sharing';
  
  try {
    console.log('Fetching data from Google Sheets...');
    const data = await getGoogleSheetsData(url);
    
    console.log(`Found ${data.length} rows`);
    console.log('Sample data:', JSON.stringify(data.slice(0, 3), null, 2));
    
    await writeToJson(data, 'sheets-output.json');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGoogleSheets();
