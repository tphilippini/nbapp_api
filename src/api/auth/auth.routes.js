'use strict';

import { Router } from 'express';
import authController from '@/api/auth/auth.controller';

const authRouter = Router();

authRouter.post('/token', authController.post);
authRouter.post('/google/token', authController.google);
authRouter.post('/facebook/token', authController.facebook);
authRouter.post('/forgot', authController.forgot);
authRouter.post('/reset', authController.reset);
authRouter.post('/confirm', authController.confirm);
authRouter.post('/validate', authController.validate);

export default authRouter;
