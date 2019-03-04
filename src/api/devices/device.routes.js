'use strict'

import { Router } from 'express'
import { regex } from '@/helpers/validator'
import deviceController from '@/api/devices/device.controller'

const deviceRouter = Router();

deviceRouter.patch(`/:uuid(${regex.uuid})`, deviceController.patch);

export default deviceRouter;
