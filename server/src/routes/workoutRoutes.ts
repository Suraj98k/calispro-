import { Router } from 'express';
import { getWorkouts, getWorkoutById, createWorkout } from '../controllers/workoutController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getWorkouts);
router.get('/:id', authenticate, getWorkoutById);
router.post('/', authenticate, createWorkout);

export default router;
