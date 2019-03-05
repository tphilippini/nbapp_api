'use strict';

import { Router } from 'express';
import userController from '@/api/users/user.controller';
import userGuardMidd from '@/middlewares/userGuard';

const userRouter = Router();

// Middlewares dedicated to these routes here
userRouter.post('/', userController.post);
userRouter.get('/', userGuardMidd, userController.getAll);
userRouter.get('/current', userGuardMidd, userController.getCurrent);

export default userRouter;
