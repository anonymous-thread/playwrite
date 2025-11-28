import { Router, Request, Response } from 'express';
import { JobManager } from '../services/jobManager';

const router = Router();

router.post('/run', async (req: Request, res: Response): Promise<void> => {
  try {
    const { processor, ...args } = req.body;

    if (!processor) {
      res.status(400).json({ error: 'Processor name is required' });
      return;
    }

    const jobId = JobManager.startJob(processor, args);

    // Check if job failed immediately (e.g. processor not found)
    const job = JobManager.getJob(jobId);
    if (job && job.status === 'failed') {
       res.status(404).json({ error: job.error, jobId });
       return;
    }

    res.status(200).json({ 
      message: 'Execution started successfully',
      jobId
    });

  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
});

router.get('/status/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = JobManager.getJob(id);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(200).json(job);
});

router.get('/jobs', (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: any = {};
  
  if (status) {
    filter.status = status;
  }

  const jobs = JobManager.getJobs(filter);
  res.status(200).json(jobs);
});

export default router;
