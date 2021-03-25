"use strict";

var _dayjs = _interopRequireDefault(require("dayjs"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _pIteration = require("p-iteration");

var _log = _interopRequireDefault(require("../../helpers/log"));

var _match = _interopRequireDefault(require("../../api/matches/match.model"));

var _player = _interopRequireDefault(require("../../api/players/player.model"));

var _team = _interopRequireDefault(require("../../api/teams/team.model"));

var _matchStats = _interopRequireDefault(require("../../api/matches-stats/match-stats.model"));

var _nba = require("../api/nba");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

function saveStats(_x, _x2) {
  return _saveStats.apply(this, arguments);
}

function _saveStats() {
  _saveStats = _asyncToGenerator(function* (match, stats) {
    yield (0, _pIteration.forEachSeries)(stats, /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (stat) {
        return (// eslint-disable-next-line implicit-arrow-linebreak
          new Promise( /*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(function* (resolve) {
              // find the player
              var player = yield _player.default.findOne({
                playerId: stat.personId
              }); // find the stats

              var existingMatchStat = yield _matchStats.default.findOne({
                playerIdFull: stat.personId,
                matchIdFull: match.matchId
              });

              if (existingMatchStat) {
                _log.default.info('----------------------------------');

                _log.default.info('MatchStat exists, updating the record now...');

                existingMatchStat.statsJSON = {
                  p: parseInt(stat.points, 10),
                  a: parseInt(stat.assists, 10),
                  or: parseInt(stat.offReb, 10),
                  dr: parseInt(stat.defReb, 10),
                  b: parseInt(stat.blocks, 10),
                  min: stat.min,
                  s: parseInt(stat.steals, 10),
                  fgm: parseInt(stat.fgm, 10),
                  fga: parseInt(stat.fga, 10),
                  tm: parseInt(stat.tpm, 10),
                  ta: parseInt(stat.tpa, 10)
                };

                try {
                  var existingMatchStatPlayer = new _matchStats.default(existingMatchStat);
                  yield existingMatchStatPlayer.updateOne(existingMatchStat).then(() => {
                    _log.default.success("updated stats for: ".concat(player.name, " matchId: ").concat(match.matchId));
                  });
                } catch (error) {
                  _log.default.error('MatchStat for player doesnt update, see error...');

                  _log.default.error(error);
                }
              } else {
                _log.default.info('----------------------------------');

                _log.default.info('MatchStat doesnt exist, creating new record now...');

                var matchStat = {
                  matchIdFull: match.matchId,
                  playerIdFull: stat.personId,
                  statsJSON: {
                    p: parseInt(stat.points, 10),
                    a: parseInt(stat.assists, 10),
                    or: parseInt(stat.offReb, 10),
                    dr: parseInt(stat.defReb, 10),
                    b: parseInt(stat.blocks, 10),
                    min: stat.min,
                    s: parseInt(stat.steals, 10),
                    fgm: parseInt(stat.fgm, 10),
                    fga: parseInt(stat.fga, 10),
                    tm: parseInt(stat.tpm, 10),
                    ta: parseInt(stat.tpa, 10)
                  },
                  player,
                  match
                };

                try {
                  var matchS = new _matchStats.default(matchStat);
                  yield matchS.save().then(m => {
                    _log.default.success("MatchStat saved for: ".concat(player.name, " matchId: ").concat(match.matchId)); // Update stats list in match for populate


                    match.stats.push(m._id);
                  });
                  yield match.save().then(() => {
                    _log.default.success('Saved stats in existing match...');

                    _log.default.info('----------------------------------');
                  });
                } catch (error) {
                  _log.default.error('MatchStat doesnt save, see error...');

                  _log.default.error(error);
                }
              }

              resolve();
            });

            return function (_x5) {
              return _ref3.apply(this, arguments);
            };
          }())
        );
      });

      return function (_x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
  return _saveStats.apply(this, arguments);
}

function main(_x3) {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(function* (dateFormatted) {
    return new Promise( /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (resolve) {
        // MATCHES
        _log.default.info('Finding today matches...');

        var todaysMatches = yield (0, _nba.findTodayMatches)(dateFormatted);

        _log.default.info("Todays matches found : ".concat(todaysMatches.length));

        if (todaysMatches.length > 0) {
          _log.default.info('Finding teams...');

          var teams = yield _team.default.find({
            isNBAFranchise: true
          });
          yield (0, _pIteration.forEachSeries)(todaysMatches, /*#__PURE__*/function () {
            var _ref5 = _asyncToGenerator(function* (game) {
              var existingMatch = yield _match.default.findOne({
                matchId: game.gameId
              }); // if match exists and it's not over, update it

              if (existingMatch && existingMatch.statusNum !== 3) {
                _log.default.info('----------------------------------');

                _log.default.info("".concat(game.vTeam.triCode, " ").concat(game.vTeam.score, " @ ").concat(game.hTeam.score, " ").concat(game.hTeam.triCode));

                _log.default.info('Match exists, game is live, updating the record now...');

                existingMatch.isGameActivated = game.isGameActivated;
                existingMatch.nuggetText = game.nugget.text;
                existingMatch.hTeamScore = game.hTeam.score;
                existingMatch.vTeamScore = game.vTeam.score;
                existingMatch.statusNum = game.statusNum;
                existingMatch.hTeamWins = game.hTeam.win;
                existingMatch.hTeamLosses = game.hTeam.loss;
                existingMatch.vTeamWins = game.vTeam.win;
                existingMatch.vTeamLosses = game.vTeam.loss;
                existingMatch.currentPeriod = game.period.current;
                existingMatch.periodType = game.period.type;
                existingMatch.maxRegular = game.period.maxRegular;
                existingMatch.isHalfTime = game.period.isHalftime;
                existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;

                try {
                  var data = new _match.default(existingMatch);
                  yield data.updateOne(existingMatch).then(() => {
                    _log.default.success('Match is live, updated game info...');
                  });
                } catch (error) {
                  _log.default.error('Match doesnt update, see error...');

                  _log.default.error(error);
                }
              } else if (existingMatch && existingMatch.statusNum === 3) {
                _log.default.info('----------------------------------');

                _log.default.info("".concat(game.vTeam.triCode, " ").concat(game.vTeam.score, " @ ").concat(game.hTeam.score, " ").concat(game.hTeam.triCode));

                _log.default.info('Match exists, game is over, updating the record now...');

                existingMatch.endTimeUTC = game.endTimeUTC;
                existingMatch.isGameActivated = game.isGameActivated;
                existingMatch.nuggetText = game.nugget.text;
                existingMatch.currentPeriod = game.period.current;
                existingMatch.periodType = game.period.type;
                existingMatch.maxRegular = game.period.maxRegular;
                existingMatch.isHalfTime = game.period.isHalftime;
                existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;

                try {
                  var _data = new _match.default(existingMatch);

                  yield _data.updateOne(existingMatch).then(() => {
                    _log.default.success('Match updated...');
                  });
                } catch (error) {
                  _log.default.error('Match doesnt update, see error...');

                  _log.default.error(error);
                }
              } else {
                _log.default.info('----------------------------------');

                _log.default.info("".concat(game.vTeam.triCode, " ").concat(game.vTeam.score, " @ ").concat(game.hTeam.score, " ").concat(game.hTeam.triCode));

                _log.default.info('Match doesnt exist, creating new record now...');

                var hTeam = teams.find(t => t.teamTriCode === game.hTeam.triCode);
                var vTeam = teams.find(t => t.teamTriCode === game.vTeam.triCode);
                var match = {
                  matchId: game.gameId,
                  startDateEastern: game.startDateEastern,
                  startTimeUTCString: game.startTimeUTC,
                  startTimeUTC: new Date(game.startTimeUTC),
                  endTimeUTC: game.endTimeUTC ? game.endTimeUTC : new Date(),
                  isGameActivated: game.isGameActivated,
                  hTeam: hTeam._id,
                  hTeamId: game.hTeam.teamId,
                  hTeamWins: game.hTeam.win,
                  hTeamLosses: game.hTeam.loss,
                  hTeamTriCode: game.hTeam.triCode,
                  hTeamScore: game.hTeam.score,
                  vTeam: vTeam._id,
                  vTeamId: game.vTeam.teamId,
                  vTeamWins: game.vTeam.win,
                  vTeamLosses: game.vTeam.loss,
                  vTeamTriCode: game.vTeam.triCode,
                  vTeamScore: game.vTeam.score,
                  statusNum: game.statusNum,
                  nuggetText: game.nugget.text,
                  currentPeriod: game.period.current,
                  periodType: game.period.type,
                  maxRegular: game.period.maxRegular,
                  isHalfTime: game.period.isHalftime,
                  isEndOfPeriod: game.period.isEndOfPeriod
                };

                try {
                  var _data2 = new _match.default(match);

                  yield _data2.save().then(() => {
                    _log.default.success('Match saved...');
                  });
                } catch (error) {
                  _log.default.error('Match doesnt save, see error...');

                  _log.default.error(error);
                }
              }
            });

            return function (_x7) {
              return _ref5.apply(this, arguments);
            };
          }());

          _log.default.info('----------------------------------');

          yield (0, _pIteration.forEachSeries)(todaysMatches, /*#__PURE__*/function () {
            var _ref6 = _asyncToGenerator(function* (game) {
              var existingMatch = yield _match.default.findOne({
                matchId: game.gameId
              }); // if match exists and has started or is over

              if (existingMatch && (existingMatch.statusNum === 2 || existingMatch.statusNum === 3)) {
                _log.default.info('----------------------------------');

                _log.default.info("".concat(game.vTeam.triCode, " ").concat(game.vTeam.score, " @ ").concat(game.hTeam.score, " ").concat(game.hTeam.triCode));

                _log.default.info('Match exists, updating the record now...');

                var result = yield (0, _nba.checkBoxScore)(dateFormatted, game.gameId);

                _log.default.info('Saving players stats...');

                yield saveStats(existingMatch, result.stats.activePlayers);
                existingMatch.gameClock = result.basicGameData.clock;
                existingMatch.hTeamScore = result.basicGameData.hTeam.score;
                existingMatch.vTeamScore = result.basicGameData.vTeam.score; // update the quarter scores

                existingMatch.hTeamQScore = result.basicGameData.hTeam.linescore.map(item => item.score);
                existingMatch.vTeamQScore = result.basicGameData.vTeam.linescore.map(item => item.score);

                try {
                  var data = new _match.default(existingMatch);
                  yield data.updateOne(existingMatch).then(() => {
                    _log.default.info('----------------------------------');

                    _log.default.success('Match is live, updated game info...');
                  });
                } catch (error) {
                  _log.default.error('Match didnt start probably, see error...');

                  _log.default.error(error);
                }
              } else {
                _log.default.info('----------------------------------');

                _log.default.info('Match doesnt exist, didnt start probably...');
              }
            });

            return function (_x8) {
              return _ref6.apply(this, arguments);
            };
          }());

          _log.default.info('----------------------------------');

          _log.default.success('Match record save/update complete...');
        }

        resolve();
      });

      return function (_x6) {
        return _ref4.apply(this, arguments);
      };
    }());
  });
  return _main.apply(this, arguments);
}

_asyncToGenerator(function* () {
  _mongoose.default.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  _log.default.title('Initialization');

  var {
    connection
  } = _mongoose.default;
  connection.once('open', () => {
    _log.default.success("Hi! Connecting to the database ".concat(process.env.DB_NAME));
  });
  connection.on('error', err => {
    _log.default.error("Connection error to the database ".concat(process.env.DB_NAME));

    if (err) {
      _log.default.default(err.message);
    }

    process.exit(1);
  });

  _log.default.title('Main'); // grab todays games and continue to update


  var todayDate = (0, _dayjs.default)().hour() < 18 ? (0, _dayjs.default)().subtract(1, 'd').format('YYYYMMDD') : (0, _dayjs.default)().format('YYYYMMDD');

  _log.default.info("Running matches on ".concat(todayDate));

  yield main(todayDate).then(() => {
    _log.default.info('----------------------------------');

    _log.default.info('Closed database connection');
  });
  connection.close();
})();