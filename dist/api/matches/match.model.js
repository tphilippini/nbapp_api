"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _team = _interopRequireDefault(require("../teams/team.model"));

var _matchStats = _interopRequireDefault(require("../matches-stats/match-stats.model"));

var _player = _interopRequireDefault(require("../players/player.model"));

var _youtube = _interopRequireDefault(require("../videos/youtube.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable func-names */

/* eslint-disable no-unused-vars */

/* eslint-disable arrow-body-style */
var MatchesSchema = new _mongoose.default.Schema({
  id: Number,
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  isGameActivated: Boolean,
  startDateEastern: String,
  startTimeUTCString: String,
  startTimeUTC: Date,
  endTimeUTC: Date,
  hTeam: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Teams'
  },
  hTeamId: String,
  hTeamWins: String,
  hTeamLosses: String,
  hTeamTriCode: String,
  hTeamScore: String,
  vTeam: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Teams'
  },
  vTeamId: String,
  vTeamWins: String,
  vTeamLosses: String,
  vTeamTriCode: String,
  vTeamScore: String,
  statusNum: Number,
  nuggetText: String,
  gameClock: String,
  currentPeriod: Number,
  periodType: Number,
  maxRegular: Number,
  isHalfTime: Boolean,
  isEndOfPeriod: Boolean,
  hTeamQScore: Object,
  vTeamQScore: Object,
  stats: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'MatchesStats'
  }],
  videos: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'YoutubeVideos'
  }]
}, {
  toJSON: {
    virtuals: true
  }
});
MatchesSchema.virtual('hTeamRecordFormatted').get(function () {
  return "".concat(this.hTeamWins, "-").concat(this.hTeamLosses);
});
MatchesSchema.virtual('vTeamRecordFormatted').get(function () {
  return "".concat(this.vTeamWins, "-").concat(this.vTeamLosses);
});

MatchesSchema.statics.findMatchesByStartDate = function (date) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    this.find({
      startDateEastern: date
    }, (error, matches) => {
      if (error) {
        console.log(error);
        return reject(error);
      }

      resolve(matches);
    }).select('-__v').select('-_id').populate({
      path: 'videos',
      select: '-_id -__v',
      populate: {
        path: 'players',
        select: '-_id -__v'
      }
    }).populate({
      path: 'stats',
      select: '-_id -__v',
      populate: {
        path: 'player',
        select: '-_id -__v'
      }
    }).populate('hTeam vTeam', '-_id -__v'); // use leanQueries for extra data manipulation for frontend
    // .lean({ virtuals: true });
  });
};

MatchesSchema.pre('remove', next => {
  (void 0).model('MatchesStats').deleteMany({
    match: (void 0)._id
  }, next);
  (void 0).model('YoutubeVideos').deleteMany({
    match: (void 0)._id
  }, next);
});

var Matches = _mongoose.default.model('Matches', MatchesSchema, 'Matches');

var _default = Matches;
exports.default = _default;