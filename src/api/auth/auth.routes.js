'use strict';

import { Router } from 'express';

import authController from '@/api/auth/auth.controller';

const authRouter = Router();

authRouter.post('/token', authController.post);
// authRouter.post('/forgot', authController.forgot);
// authRouter.post('/reset', authController.reset);
// authRouter.post('/validate', authController.validate);

export default authRouter;
