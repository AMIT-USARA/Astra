import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeLimiter } from '../middleware/security.js';
import { analyzeResume, history, getOne, removeOne, report } from '../controllers/resumeController.js';

// Express 5 forwards rejected promises from async handlers to the error handler.
const router = Router();
router.use(requireAuth);
router.post('/analyze', analyzeLimiter, upload.single('resume'), analyzeResume);
router.get('/history', history);
router.get('/:id', getOne);
router.delete('/:id', removeOne);
router.get('/:id/report', report);
export default router;
