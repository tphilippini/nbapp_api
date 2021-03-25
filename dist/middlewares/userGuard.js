'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _response = _interopRequireDefault(require("../helpers/response"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userGuardMidd = (req, res, next) => {
  if (req.user) {
    if (req.user.user_type !== 'user') {
      _response.default.error(res, 403, ['insufficient_rights']);
    } else {
      next();
    }
  }
};

var _default = userGuardMidd;
exports.default = _default;