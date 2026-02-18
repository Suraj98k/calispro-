import { Router } from 'express';
import { getSkills, getSkillById, getUserMastery, updateMasteryPoints } from '../controllers/skillController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getSkills);
router.get('/:id', getSkillById);
router.get('/user/progress', authenticate, getUserMastery);
router.post('/user/progress', authenticate, updateMasteryPoints);

export default router;
