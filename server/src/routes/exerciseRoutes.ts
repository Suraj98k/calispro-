import { Router } from 'express';
import { getExercises, getExerciseById } from '../controllers/exerciseController.js';

const router = Router();

router.get('/', getExercises);
router.get('/:id', getExerciseById);

export default router;
