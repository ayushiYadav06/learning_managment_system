import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import authRoutes from './auth.js';
import subscriptionRoutes from './subscriptions.js';
import moduleRoutes from './modules.js';
import billingPlanRoutes from './billingPlans.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subscriptions', authMiddleware, subscriptionRoutes);
router.use('/modules', authMiddleware, moduleRoutes);
router.use('/billing-plans', authMiddleware, billingPlanRoutes);

export default router;
