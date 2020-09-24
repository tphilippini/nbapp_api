'use strict';

import { Router } from 'express';
import leagueController from '@/api/leagues/league.controller';
import userGuardMidd from '@/middlewares/userGuard';
import { regex } from '@/helpers/validator';

const leagueRouter = Router();

leagueRouter.get(
  `/:uuid(${regex.uuid})`,
  userGuardMidd,
  leagueController.getByUser
);
leagueRouter.post('/', userGuardMidd, leagueController.post);

export default leagueRouter;
