"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MatchesStatsSchema = new _mongoose.default.Schema({
  id: Number,
  matchIdFull: String,
  playerIdFull: String,
  statsJSON: Object,
  player: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Players'
  },
  match: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Matches'
  }
});

var MatchesStats = _mongoose.default.model('MatchesStats', MatchesStatsSchema, 'MatchesStats');

var _default = MatchesStats;
exports.default = _default;