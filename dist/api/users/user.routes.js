'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _user = _interopRequireDefault(require("./user.controller"));

var _userGuard = _interopRequireDefault(require("../../middlewares/userGuard"));

var _validator = require("../../helpers/validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userRouter = (0, _express.Router)(); // Middlewares dedicated to these routes here

userRouter.post('/', _user.default.post);
userRouter.patch("/:uuid(".concat(_validator.regex.uuid, ")"), _userGuard.default, _user.default.patch);
userRouter.get('/current', _userGuard.default, _user.default.getCurrent);
userRouter.post('/:method/link', _userGuard.default, _user.default.linkAccount);
userRouter.post('/:method/unlink', _userGuard.default, _user.default.unlinkAccount); // userRouter.get('/', userGuardMidd, userController.getAll);
// userRouter.get("/test", userController.getAll);

var _default = userRouter;
exports.default = _default;