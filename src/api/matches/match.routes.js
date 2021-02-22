'use strict';

import { Router } from 'express';
import matchController from '@/api/matches/match.controller';
// import userGuardMidd from '@/middlewares/userGuard';
import { regex } from '@/helpers/validator';

const matchRouter = Router();

matchRouter.get(
  `/:startDate(${regex.date.yyyymmdd})`,
  // userGuardMidd,
  matchController.matchByDate
);

export default matchRouter;
