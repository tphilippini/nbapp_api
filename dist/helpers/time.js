'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timestamp = exports.datetime = void 0;

var datetime = () => {
  var current = new Date();
  var date = "".concat(current.getFullYear(), "-").concat(current.getMonth() + 1, "-").concat(current.getDate());
  var time = "".concat(current.getHours(), ":").concat(current.getMinutes(), ":").concat(current.getSeconds());
  return "".concat(date, " ").concat(time);
}; // Have to convert from milliseconds to seconds


exports.datetime = datetime;

var timestamp = () => new Date().getTime() / 1000;

exports.timestamp = timestamp;