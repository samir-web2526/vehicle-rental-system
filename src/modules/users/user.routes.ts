import express from 'express';
import { userControllers } from './user.controller';
import logger from '../../middleware/logger';
import auth from '../../middleware/auth';

const router = express.Router();

router.get('/',auth("admin"), userControllers.getUser);

router.put("/:id",logger,auth("admin","customer"), userControllers.updateUser);

router.delete("/:id",logger,auth("admin"), userControllers.deleteUser);

export const userRoutes = router;