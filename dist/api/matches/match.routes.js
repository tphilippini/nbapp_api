'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _match = _interopRequireDefault(require("./match.controller"));

var _validator = require("../../helpers/validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import userGuardMidd from '@/middlewares/userGuard';
var matchRouter = (0, _express.Router)();
matchRouter.get("/:startDate(".concat(_validator.regex.date.yyyymmdd, ")"), // userGuardMidd,
_match.default.matchByDate);
var _default = matchRouter;
exports.default = _default;