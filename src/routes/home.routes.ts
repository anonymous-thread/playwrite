import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Documentation</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .endpoint { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
        .endpoint h2 { margin-top: 0; color: #0056b3; }
        pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { font-family: 'Courier New', Courier, monospace; }
        .method { font-weight: bold; color: #fff; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; }
        .post { background-color: #28a745; }
        .get { background-color: #007bff; }
      </style>
    </head>
    <body>
      <h1>API Documentation</h1>

      <div class="endpoint">
        <h2><span class="method post">POST</span> /run</h2>
        <p>Trigger a processor execution.</p>
        <pre><code>curl -X POST http://localhost:3000/run \\
  -H "Content-Type: application/json" \\
  -d '{"processor": "googlemap", "query": "your search query", "toSaveInFile":"true", "toSendEmail":"false"}'</code></pre>
      </div>

      <div class="endpoint">
        <h2><span class="method get">GET</span> /status/:id</h2>
        <p>Check the status of a specific job.</p>
        <pre><code>curl http://localhost:3000/status/&lt;job_id&gt;</code></pre>
      </div>

      <div class="endpoint">
        <h2><span class="method get">GET</span> /jobs</h2>
        <p>List all jobs. Optional filter by status.</p>
        <pre><code>curl "http://localhost:3000/jobs?status=running"</code></pre>
      </div>

      <div class="endpoint">
        <h2><span class="method get">GET</span> /server-health</h2>
        <p>Check server health and uptime.</p>
        <pre><code>curl http://localhost:3000/server-health</code></pre>
      </div>

      <div class="endpoint">
        <h2><span class="method delete" style="background-color: #dc3545;">DELETE</span> /files/:filename</h2>
        <p>Delete an output file from the server.</p>
        <pre><code>curl -X DELETE http://localhost:3000/files/&lt;filename&gt;</code></pre>
      </div>
    </body>
    </html>
  `;
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(html);
});

export default router;
