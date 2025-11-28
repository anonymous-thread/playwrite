import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

router.delete('/files/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    // Prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }

    // Construct the file path (files are saved in 'outfile' directory)
    const filePath = path.join(process.cwd(), 'outfile', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({ 
      message: 'File deleted successfully',
      filename 
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
