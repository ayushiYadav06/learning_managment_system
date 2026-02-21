import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import * as subscribedModuleController from '../controllers/subscribedModuleController.js';
import * as emailConfigController from '../controllers/emailConfigController.js';

const router = Router();

router.get('/', subscriptionController.list);
router.post('/', subscriptionController.create);

router.get('/:id/details', subscriptionController.getDetails);
router.get('/:subscriptionId/modules', subscribedModuleController.getAssignedModules);
router.put('/:subscriptionId/modules', subscribedModuleController.assignModules);
router.get('/:subscriptionId/email-config', emailConfigController.getBySubscriptionId);
router.put('/:subscriptionId/email-config', emailConfigController.updateBySubscriptionId);
router.post('/:subscriptionId/email-config/test', emailConfigController.sendTestBySubscriptionId);

router.get('/:id', subscriptionController.getById);
router.patch('/:id', subscriptionController.update);
router.post('/:id/reset-password', subscriptionController.resetPassword);
router.delete('/:id', subscriptionController.remove);

export default router;
