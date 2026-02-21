import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import authRoutes from './auth.js';
import subscriptionRoutes from './subscriptions.js';
import moduleRoutes from './modules.js';
import billingPlanRoutes from './billingPlans.js';
import * as subscriptionLogController from '../controllers/subscriptionLogController.js';
import * as billingSubscriptionLogController from '../controllers/billingSubscriptionLogController.js';
import * as subscriptionPlanAssignmentController from '../controllers/subscriptionPlanAssignmentController.js';
import * as adminEmailConfigController from '../controllers/adminEmailConfigController.js';

const router = Router();

router.use('/auth', authRoutes);
router.get('/subscription-logs', authMiddleware, subscriptionLogController.listAll);
router.get('/billing-subscription-logs', authMiddleware, billingSubscriptionLogController.listAll);

router.get('/subscriptions/:subscriptionId/plan-assignments', authMiddleware, subscriptionPlanAssignmentController.getPlanAssignments);
router.put('/subscriptions/:subscriptionId/plan-assignments', authMiddleware, subscriptionPlanAssignmentController.setPlanAssignments);

router.get('/admin/email-config', authMiddleware, adminEmailConfigController.getConfig);
router.put('/admin/email-config', authMiddleware, adminEmailConfigController.updateConfig);

router.use('/subscriptions', authMiddleware, subscriptionRoutes);
router.use('/modules', authMiddleware, moduleRoutes);
router.use('/billing-plans', authMiddleware, billingPlanRoutes);

export default router;
