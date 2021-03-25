"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findTodayMatches = findTodayMatches;
exports.findTeams = findTeams;
exports.checkGameStatus = checkGameStatus;
exports.checkTeamRoster = checkTeamRoster;
exports.checkPlayers = checkPlayers;
exports.checkBoxScore = checkBoxScore;
exports.findPlayerLatestStats = findPlayerLatestStats;
exports.calcEfficiency = calcEfficiency;
exports.calcNotation = calcNotation;

var _dayjs = _interopRequireDefault(require("dayjs"));

var _axios = _interopRequireDefault(require("axios"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _utils = require("../../helpers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Stats personId:
// http://data.nba.net/data/10s/prod/v1/2019/players/2544_profile.json
// https://basketinfo.com/L-evaluation-des-joueurs-comment.html

/**
EFF = [ (( PTS+REB+PD+INT+BLOC )) + (( TT-TM ) + ( LFT-LFM ) - BP )) ] / MJ

- EFF : efficiency : évaluation

- PTS : nombre total de points marqués dans une compétition

- REB : nombre total de rebonds pris dans une compétition

- PD ( AST ) : nombre de passes décisives dans une compétition

- INT ( STL ) : nombre total d’interceptions dans une compétition

- BLOC ( BLK ) : nombre total de contres dans une compétition

- TT ( FGA ) : nombre de tirs tentés dans une compétition

- TM ( FGM ) : nombre total de tirs ratés dans une compétition

- LFT ( FTA ) : nombre total de lancers tentés dans une compétition

- LFM ( FTM ) : nombre totale de lancers ratés dans une compétition

- BP ( TO ) : nombre totale de balles perdues dans une compétition

- MJ ( G ) : nombre de matches joués dans une compétition
*/
function findTodayMatches(_x) {
  return _findTodayMatches.apply(this, arguments);
}

function _findTodayMatches() {
  _findTodayMatches = _asyncToGenerator(function* (date) {
    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (resolve, reject) {
        try {
          var uri = "https://data.nba.net/prod/v2/".concat(date, "/scoreboard.json");

          _log.default.success(uri);

          var matches = yield _axios.default.get(uri);
          resolve(matches.data.games);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x7, _x8) {
        return _ref.apply(this, arguments);
      };
    }());
  });
  return _findTodayMatches.apply(this, arguments);
}

function findTeams() {
  return _findTeams.apply(this, arguments);
}

function _findTeams() {
  _findTeams = _asyncToGenerator(function* () {
    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // const uri = `https://data.nba.net/prod/v2/${dayjs().format(
          //   "Y"
          // )}/teams.json`;
          var uri = 'https://data.nba.net/prod/v2/2020/teams.json';

          _log.default.success(uri);

          var teams = yield _axios.default.get(uri);
          resolve(teams.data.league.standard);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x9, _x10) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
  return _findTeams.apply(this, arguments);
}

function checkTeamRoster(_x2) {
  return _checkTeamRoster.apply(this, arguments);
}

function _checkTeamRoster() {
  _checkTeamRoster = _asyncToGenerator(function* (teamShortName) {
    return new Promise( /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // const uri = `https://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2019-20&TeamID=${teamId}`;
          // /prod/v1/2019/teams/{{teamUrlCode}}/roster.json
          // https://data.nba.net/prod/v1/2019/players.json
          var uri = "https://data.nba.net/data/json/cms/2020/team/".concat(teamShortName, "/roster.json");

          _log.default.success(uri);

          var roster = yield _axios.default.get(uri);
          resolve(roster.data.sports_content.roster.players.player);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x11, _x12) {
        return _ref3.apply(this, arguments);
      };
    }());
  });
  return _checkTeamRoster.apply(this, arguments);
}

function checkPlayers() {
  return _checkPlayers.apply(this, arguments);
}

function _checkPlayers() {
  _checkPlayers = _asyncToGenerator(function* () {
    return new Promise( /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // const uri = `https://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2019-20&TeamID=${teamId}`;
          // /prod/v1/2019/teams/{{teamUrlCode}}/roster.json
          // https://data.nba.net/prod/v1/2019/players.json
          var uri = 'https://data.nba.net/prod/v1/2020/players.json';

          _log.default.success(uri);

          var roster = yield _axios.default.get(uri);
          resolve(roster.data.league.standard);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x13, _x14) {
        return _ref4.apply(this, arguments);
      };
    }());
  });
  return _checkPlayers.apply(this, arguments);
}

function checkGameStatus(_x3) {
  return _checkGameStatus.apply(this, arguments);
}

function _checkGameStatus() {
  _checkGameStatus = _asyncToGenerator(function* (matches) {
    return new Promise( /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (resolve) {
        var notStarted = [];
        var active = [];
        var over = [];
        var overRecent = [];
        matches.forEach(match => {
          if (match.statusNum === 3) {
            // game is over
            // check how many hours ago it ended
            var postGameHours = (0, _dayjs.default)().diff((0, _dayjs.default)(match.endTimeUTC), 'hours');

            if (postGameHours > '12') {
              over.push(match);
            } else {
              overRecent.push(match);
            }
          } else if (match.statusNum === 1) {
            // game hasn't started
            notStarted.push(match);
          } else if (match.statusNum === 2) {
            // game is active
            active.push(match);
          }
        });
        resolve({
          notStarted,
          active,
          over,
          overRecent
        });
      });

      return function (_x15) {
        return _ref5.apply(this, arguments);
      };
    }());
  });
  return _checkGameStatus.apply(this, arguments);
}

function checkBoxScore(_x4, _x5) {
  return _checkBoxScore.apply(this, arguments);
}

function _checkBoxScore() {
  _checkBoxScore = _asyncToGenerator(function* (dateFormatted, gameId) {
    return new Promise( /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // A tester : http://data.nba.net/10s/prod/v1/20210126/0022000268_boxscore.json
          // Example : https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2019/boxscore/0041900205.js WORKS !!!
          // const url = `https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2020/boxscore/${game.gameId}.js`;
          var uri = "http://data.nba.net/10s/prod/v1/".concat(dateFormatted, "/").concat(gameId, "_boxscore.json");

          _log.default.success(uri);

          var boxscore = yield _axios.default.get(uri);
          resolve(boxscore.data);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x16, _x17) {
        return _ref6.apply(this, arguments);
      };
    }());
  });
  return _checkBoxScore.apply(this, arguments);
}

function findPlayerLatestStats(_x6) {
  return _findPlayerLatestStats.apply(this, arguments);
}

function _findPlayerLatestStats() {
  _findPlayerLatestStats = _asyncToGenerator(function* (playerId) {
    return new Promise( /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (resolve, reject) {
        try {
          var uri = "http://data.nba.net/data/10s/prod/v1/2020/players/".concat(playerId, "_profile.json");

          _log.default.success(uri);

          var profile = yield _axios.default.get(uri);
          var {
            latest
          } = profile.data.league.standard.stats;
          resolve(latest);
        } catch (error) {
          _log.default.error(error);

          reject(error);
        }
      });

      return function (_x18, _x19) {
        return _ref7.apply(this, arguments);
      };
    }());
  });
  return _findPlayerLatestStats.apply(this, arguments);
}

function calcEfficiency(stats) {
  var sumBonus = (0, _utils.sum)([stats.points, stats.totReb, stats.assists, stats.steals, stats.blocks]);
  var missedFG = parseFloat(stats.fga) - parseFloat(stats.fgm);
  var missedFT = parseFloat(stats.fta) - parseFloat(stats.ftm); // eslint-disable-next-line operator-linebreak

  var efficiency = // eslint-disable-next-line operator-linebreak
  (sumBonus - missedFG - missedFT - parseFloat(stats.turnovers)) / stats.gamesPlayed;
  return Math.round(efficiency * 100) / 100;
}
/**
  Efficiency table
  All-time great season                 35.0+
  Runaway MVP candidate                 30.0–35.0 => 10
  Strong MVP candidate                  27.5–30.0 => 9
  Weak MVP candidate                    25.0–27.5 => 8
  Definite All-Star                     22.5–25.0
  Borderline All-Star                   20.0–22.5 => 7
  Second offensive option               18.0–20.0 => 6
  Third offensive option                16.5–18.0 => 5
  Slightly above-average player         15.0–16.5 => 4
  Rotation player                       13.0–15.0 => 3
  Non-rotation player                   11.0–13.0 => 2
  Fringe roster player                  9.0–11.0
  Player who won't stick in the league  0–9.0 => 1
*/


function calcNotation(eff) {
  var notation = 1;

  switch (true) {
    case eff < 11.0:
      notation = 1;
      break;

    case eff >= 11.0 && eff < 13.0:
      notation = 2;
      break;

    case eff >= 13.0 && eff < 15.0:
      notation = 3;
      break;

    case eff >= 15.0 && eff < 16.5:
      notation = 4;
      break;

    case eff >= 16.5 && eff < 18.0:
      notation = 5;
      break;

    case eff >= 18.0 && eff < 20.0:
      notation = 6;
      break;

    case eff >= 20.0 && eff < 25.0:
      notation = 7;
      break;

    case eff >= 25.0 && eff < 27.5:
      notation = 8;
      break;

    case eff >= 27.5 && eff < 30.0:
      notation = 9;
      break;

    case eff >= 30.0:
      notation = 10;
      break;

    default:
      break;
  }

  return notation;
}