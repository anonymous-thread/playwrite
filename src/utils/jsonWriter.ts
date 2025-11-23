import * as fs from 'fs';
import * as path from 'path';

/**
 * Writes data to a JSON file in the outfile directory
 * @param data - The data to write
 * @param filename - The filename (without path)
 */
export async function writeToJson(data: any, filename: string): Promise<void> {
  const fullPath = `outfile/${filename}`;
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const jsonContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(fullPath, jsonContent, 'utf-8');
  
  console.log(`Data saved to ${fullPath}`);
}
