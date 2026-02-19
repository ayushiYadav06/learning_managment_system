import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import authRoutes from './auth.js';
import subscriptionRoutes from './subscriptions.js';
import moduleRoutes from './modules.js';
import billingPlanRoutes from './billingPlans.js';
import * as subscriptionLogController from '../controllers/subscriptionLogController.js';
import * as billingSubscriptionLogController from '../controllers/billingSubscriptionLogController.js';

const router = Router();

router.use('/auth', authRoutes);
router.get('/subscription-logs', authMiddleware, subscriptionLogController.listAll);
router.get('/billing-subscription-logs', authMiddleware, billingSubscriptionLogController.listAll);
router.use('/subscriptions', authMiddleware, subscriptionRoutes);
router.use('/modules', authMiddleware, moduleRoutes);
router.use('/billing-plans', authMiddleware, billingPlanRoutes);

export default router;
