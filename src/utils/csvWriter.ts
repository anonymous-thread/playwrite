import { createObjectCsvWriter } from 'csv-writer';
import { PlaceData } from '../types';

export async function writeToCsv(data: PlaceData[], filename: string): Promise<void> {
  // Map data to handle array fields (like emails)
  const records = data.map(item => ({
      ...item,
      email: item.email ? item.email.join('; ') : ''
  }));

  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'address', title: 'Address' },
      { id: 'rating', title: 'Rating' },
      { id: 'reviews', title: 'Reviews' },
      { id: 'phone', title: 'Phone' },
      { id: 'website', title: 'Website' },
      { id: 'email', title: 'Emails' },
    ],
  });

  await csvWriter.writeRecords(records);
  console.log(`Data saved to ${filename}`);
}
