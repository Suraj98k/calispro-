import { Router } from 'express';
import { logWorkout, getHistory, getStreakStats, deleteHistoryEntry, deleteAllHistory } from '../controllers/logController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, logWorkout);
router.get('/history', authenticate, getHistory);
router.delete('/history', authenticate, deleteAllHistory);
router.delete('/history/:id', authenticate, deleteHistoryEntry);
router.get('/streaks', authenticate, getStreakStats);

export default router;
