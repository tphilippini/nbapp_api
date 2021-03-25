'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var corsMidd = (req, res, next) => {
  // Allow only a specific client to request to the API (depending of the env)
  res.header('Access-Control-Allow-Origin', "http://".concat(process.env.APP_HOST, ":").concat(process.env.APP_PORT)); // Allow several headers for our requests

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
};

var _default = corsMidd;
exports.default = _default;