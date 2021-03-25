/* eslint-disable implicit-arrow-linebreak */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateToken = exports.generateResetToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _crypto = _interopRequireDefault(require("crypto"));

var _time = require("./time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generateAccessToken = (deviceId, userId, userAlias, userEmail, userType) => {
  var currentTimestamp = (0, _time.timestamp)();
  var futureTimestamp = currentTimestamp + parseInt(process.env.API_ACCESS_TOKEN_EXP, 10);
  return _jsonwebtoken.default.sign({
    iss: 'nbapp',
    exp: futureTimestamp,
    sub: deviceId,
    user: userId,
    email: userEmail,
    alias: userAlias,
    user_type: userType
  }, process.env.API_ACCESS_TOKEN_SECRET);
};

exports.generateAccessToken = generateAccessToken;

var generateRefreshToken = deviceId => _crypto.default.createHash('sha1').update(deviceId + process.env.API_REFRESH_TOKEN_SALT).digest('hex');

exports.generateRefreshToken = generateRefreshToken;

var generateResetToken = (userId, userType) => {
  var currentTimestamp = (0, _time.timestamp)();
  var futureTimestamp = currentTimestamp + parseInt(process.env.API_RESET_TOKEN_EXP, 10);
  return _jsonwebtoken.default.sign({
    iss: 'nbapp',
    exp: futureTimestamp,
    user: userId,
    user_type: userType
  }, process.env.API_RESET_TOKEN_SECRET);
};

exports.generateResetToken = generateResetToken;

var validateToken = (token, cb) => _jsonwebtoken.default.verify(token, process.env.API_RESET_TOKEN_SECRET, (err, decoded) => {
  if (err) return cb(false);
  return cb(true, decoded);
});

exports.validateToken = validateToken;