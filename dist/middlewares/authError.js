'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _response = _interopRequireDefault(require("../helpers/response"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authErrorMidd = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    _response.default.error(res, 401, ['invalid_access_token']);
  } else {
    next();
  }
};

var _default = authErrorMidd;
exports.default = _default;