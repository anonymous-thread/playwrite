import { ProcessorRegistry } from '../processors';
import { v4 as uuidv4 } from 'uuid';

export interface JobStatus {
  id: string;
  processor: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: any;
  startTime: Date;
  endTime?: Date;
}

export class JobManager {
  private static jobs: Map<string, JobStatus> = new Map();

  static startJob(processorName: string, args: any): string {
    const id = uuidv4();
    const job: JobStatus = {
      id,
      processor: processorName,
      status: 'pending',
      startTime: new Date()
    };

    this.jobs.set(id, job);

    const processorInstance = ProcessorRegistry.get(processorName);

    if (!processorInstance) {
      job.status = 'failed';
      job.error = `Processor "${processorName}" not found`;
      job.endTime = new Date();
      return id;
    }

    job.status = 'running';

    // Run asynchronously
    processorInstance.run(args)
      .then(() => {
        job.status = 'completed';
        job.endTime = new Date();
        this.cleanupCompletedJobs();
      })
      .catch((err) => {
        job.status = 'failed';
        job.error = err.message || String(err);
        job.endTime = new Date();
        this.cleanupCompletedJobs();
      });

    return id;
  }

  static getJob(id: string): JobStatus | undefined {
    return this.jobs.get(id);
  }

  static getJobs(filter?: Partial<JobStatus>): JobStatus[] {
    const allJobs = Array.from(this.jobs.values());
    if (!filter) {
      return allJobs;
    }

    return allJobs.filter(job => {
      for (const key in filter) {
        if (job[key as keyof JobStatus] !== filter[key as keyof JobStatus]) {
          return false;
        }
      }
      return true;
    });
  }

  private static cleanupCompletedJobs(): void {
    const completedJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'completed')
      .sort((a, b) => {
        const timeA = a.endTime?.getTime() || 0;
        const timeB = b.endTime?.getTime() || 0;
        return timeB - timeA; // Sort descending (newest first)
      });

    // Keep only the last 10 completed jobs
    if (completedJobs.length > 10) {
      const jobsToRemove = completedJobs.slice(10);
      jobsToRemove.forEach(job => {
        this.jobs.delete(job.id);
      });
    }
  }
}
