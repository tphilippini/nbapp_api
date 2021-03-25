'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _league = _interopRequireDefault(require("./league.controller"));

var _userGuard = _interopRequireDefault(require("../../middlewares/userGuard"));

var _validator = require("../../helpers/validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var leagueRouter = (0, _express.Router)();
leagueRouter.get("/:uuid(".concat(_validator.regex.uuid, ")"), _userGuard.default, _league.default.getByUser);
leagueRouter.post('/', _userGuard.default, _league.default.post);
var _default = leagueRouter;
exports.default = _default;