import { Router } from 'express';
import * as billingPlanController from '../controllers/billingPlanController.js';
import * as billingSubscriptionController from '../controllers/billingSubscriptionController.js';
import * as billingSubscriptionLogController from '../controllers/billingSubscriptionLogController.js';

const router = Router();

router.get('/', billingPlanController.list);
router.post('/', billingPlanController.create);
router.get('/:id', billingPlanController.getById);
router.patch('/:id', billingPlanController.update);
router.delete('/:id', billingPlanController.remove);

router.get('/:planId/subscription-count', billingPlanController.getSubscriptionCount);
router.get('/:planId/subscriptions', billingSubscriptionController.getAssignedSubscriptions);
router.put('/:planId/subscriptions', billingSubscriptionController.assignSubscriptions);

router.get('/:planId/logs', billingSubscriptionLogController.getByPlanId);

export default router;
