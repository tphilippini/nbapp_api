'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _log = _interopRequireDefault(require("../helpers/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose.default.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

var {
  connection
} = _mongoose.default;
connection.on('error', _log.default.error("Connection error to the database ".concat(process.env.DB_NAME)));
connection.once('open', () => {
  _log.default.success("Hi! Connected to the database ".concat(process.env.DB_NAME));
});
var _default = connection;
exports.default = _default;