import { Router } from 'express';
import processorRoutes from './processor.routes';
import healthRoutes from './health.routes';
import homeRoutes from './home.routes';
import fileRoutes from './file.routes';

const router = Router();

router.use('/', homeRoutes);
router.use('/', processorRoutes);
router.use('/', healthRoutes);
router.use('/', fileRoutes);

export default router;
