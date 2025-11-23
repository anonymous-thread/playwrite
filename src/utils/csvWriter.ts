import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

export async function writeToCsv<T extends Record<string, any>>(data: T[], filename: string): Promise<void> {
  if (!data || data.length === 0) {
    console.log('No data provided to write to CSV.');
    return;
  }

  const fullPath = `outfile/${filename}`;
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const firstRecord = data[0];
  const headers = Object.keys(firstRecord).map(key => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1)
  }));

  const records = data.map(item => {
    const transformed: Record<string, any> = {};
    for (const key of Object.keys(item)) {
      const value = (item as any)[key];
      transformed[key] = Array.isArray(value) ? value.join('; ') : value;
    }
    return transformed;
  });
  
  const csvWriter = createObjectCsvWriter({
    path: fullPath,
    header: headers,
  });

  await csvWriter.writeRecords(records);
  console.log(`Data saved to ${fullPath}`);
}

