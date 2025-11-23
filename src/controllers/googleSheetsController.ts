import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

function extractSpreadsheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid Google Sheets URL');
  }
  return match[1];
}

function getAuthenticatedClient() {
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
    path.join(process.cwd(), 'service-account.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at: ${serviceAccountPath}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getGoogleSheetsData(url: string): Promise<any[]> {
  try {
    const spreadsheetId = extractSpreadsheetId(url);
    const sheets = getAuthenticatedClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:Z',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('No data found in spreadsheet.');
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}
