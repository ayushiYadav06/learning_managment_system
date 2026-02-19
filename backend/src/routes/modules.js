import { Router } from 'express';
import * as moduleController from '../controllers/moduleController.js';

const router = Router();

router.get('/', moduleController.list);
router.post('/', moduleController.create);
router.get('/:id', moduleController.getById);
router.patch('/:id', moduleController.update);
router.delete('/:id', moduleController.remove);

export default router;
