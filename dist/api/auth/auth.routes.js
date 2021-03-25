'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _auth = _interopRequireDefault(require("./auth.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authRouter = (0, _express.Router)();
authRouter.post('/token', _auth.default.post);
authRouter.post('/google/token', _auth.default.google);
authRouter.post('/facebook/token', _auth.default.facebook);
authRouter.post('/forgot', _auth.default.forgot);
authRouter.post('/reset', _auth.default.reset);
authRouter.post('/validate', _auth.default.validate);
var _default = authRouter;
exports.default = _default;