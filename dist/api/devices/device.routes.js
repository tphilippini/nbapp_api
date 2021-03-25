'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

// import { regex } from '@/helpers/validator'
// import deviceController from '@/api/devices/device.controller'
var deviceRouter = (0, _express.Router)(); // deviceRouter.patch(`/:uuid(${regex.uuid})`, deviceController.patch);

var _default = deviceRouter;
exports.default = _default;