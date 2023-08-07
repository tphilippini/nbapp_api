'use strict';

import { Router } from 'express';
import matchController from '@/api/matches/match.controller';
import { regex } from '@/helpers/validator';
import userGuardMidd from '@/middlewares/userGuard';

const matchRouter = Router();

matchRouter.get(
  `/:startDate(${regex.date.yyyymmdd})`,
  userGuardMidd,
  matchController.matchByDate
);

export default matchRouter;
