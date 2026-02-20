import { Router } from 'express';
import * as billingPlanController from '../controllers/billingPlanController.js';

const router = Router();

router.get('/', billingPlanController.list);
router.post('/', billingPlanController.create);
router.get('/:id', billingPlanController.getById);
router.patch('/:id', billingPlanController.update);
router.delete('/:id', billingPlanController.remove);

export default router;
