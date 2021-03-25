'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidDate = exports.isSha1 = exports.regex = void 0;

var _dayjs = _interopRequireDefault(require("dayjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var regex = {
  uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
  date: {
    yyyymmdd: '20[0-9]{2}[0-9]{2}[0-9]{2}' // yyyymmdd: "[0-9]{4}-0[1-9]|1[0-2](0[1-9]|[1-2][0-9]|3[0-1])"

  },
  hash: {
    sha1: '[a-f0-9]{40}'
  }
};
exports.regex = regex;

var isSha1 = value => value.match(new RegExp(regex.hash.sha1)) !== null;

exports.isSha1 = isSha1;

var isValidDate = (date, format) => // eslint-disable-next-line implicit-arrow-linebreak
(0, _dayjs.default)(date, format).format(format) === date;

exports.isValidDate = isValidDate;