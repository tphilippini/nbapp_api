"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlayersSchema = new _mongoose.default.Schema({
  id: Number,
  name: String,
  firstName: String,
  lastName: String,
  playerId: {
    type: String,
    required: true,
    unique: true
  },
  number: String,
  position: String,
  height: String,
  heightMeters: String,
  weight: String,
  weightKgs: String,
  birthdate: String,
  age: String,
  teamId: String,
  teamTriCode: String,
  teamName: String,
  efficiency: Number,
  notation: Number
});

var Players = _mongoose.default.model('Players', PlayersSchema, 'Players');

var _default = Players;
exports.default = _default;