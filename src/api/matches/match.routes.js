"use strict";

import { Router } from "express";
import matchController from "@/api/matches/match.controller";
import userGuardMidd from "@/middlewares/userGuard";
import { regex } from "@/helpers/validator";

const matchRouter = Router();

// Middlewares dedicated to these routes here
// matchRouter.get(
//   `/:startDate(${regex.date.yyyymmdd})`,
//   userGuardMidd,
//   matchController.matchByDate
// );
matchRouter.get(`/:startDate`, userGuardMidd, matchController.matchByDate);

export default matchRouter;
