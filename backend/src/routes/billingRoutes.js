import express from 'express';
import { getPlans, upgradeTier } from '../controllers/billingController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/plans', getPlans);
router.post('/upgrade', requireAuth, upgradeTier);

export default router;
