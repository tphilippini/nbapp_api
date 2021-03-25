"use strict";

var _dayjs = _interopRequireDefault(require("dayjs"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _pIteration = require("p-iteration");

var _log = _interopRequireDefault(require("../../helpers/log"));

var _config = require("../../config/config");

var _youtube = require("../api/youtube");

var _match = _interopRequireDefault(require("../../api/matches/match.model"));

var _team = _interopRequireDefault(require("../../api/teams/team.model"));

var _player7 = _interopRequireDefault(require("../../api/players/player.model"));

var _youtube2 = _interopRequireDefault(require("../../api/videos/youtube.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

var limitHours = 18;

function matchNotFresh(endTimeUTC) {
  var hours = (0, _dayjs.default)().diff((0, _dayjs.default)(endTimeUTC), 'hours');

  _log.default.default("Time since match ended: ".concat(hours));

  return hours > limitHours;
}

function determineVideoTypeFromTitle(_x) {
  return _determineVideoTypeFromTitle.apply(this, arguments);
}

function _determineVideoTypeFromTitle() {
  _determineVideoTypeFromTitle = _asyncToGenerator(function* (title) {
    var type;
    var playerId;
    var duelIds;
    var name = "".concat(title.split(' ')[0], " ").concat(title.split(' ')[1]);

    _log.default.default("Determine video type for ".concat(name));

    var titleLowerCase = title.toLowerCase();

    if (titleLowerCase.includes('interview')) {
      var player = yield _player7.default.find({
        name
      });

      if (player.length === 1) {
        type = "interview ".concat(name);
        playerId = player[0].playerId;
      } else {
        type = 'interview unidentified';
      }

      if (titleLowerCase.includes('postgame')) {
        type += ' postgame';
      } else if (titleLowerCase.includes('pregame')) {
        type += ' pregame';
      }
    } else if (titleLowerCase.includes('highlights')) {
      type = 'highlights';

      if (titleLowerCase.includes('pts') || titleLowerCase.includes('points')) {
        // if it's a player highlight, try to figure out which player it is.
        var _player = yield _player7.default.find({
          name
        });

        if (_player.length === 1) {
          type = "player highlights ".concat(name);
          playerId = _player[0].playerId;
        } else {
          type = 'player highlights unidentified';
        }
      } else if (titleLowerCase.includes('full game') || title.includes('full highlights')) {
        type = 'full game highlights';
      } else if (titleLowerCase.includes('1st qtr')) {
        type = 'first quarter highlights';
      } else if (titleLowerCase.includes('1st half')) {
        type = 'first half highlights';
      } else if (titleLowerCase.includes('duel') || titleLowerCase.includes('battle')) {
        type = 'duel highlights'; // determine id of both players in the duel
        // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE

        var player1Name = title.split('vs')[0].slice(0, -1);
        var player2Name = '';

        if (title.split('vs')[1]) {
          player2Name = "".concat(title.split('vs')[1].split(' ')[1], " ").concat(title.split('vs')[1].split(' ')[2]);
        }

        var player1 = yield _player7.default.find({
          name: player1Name
        });
        var player2 = yield _player7.default.find({
          name: player2Name
        }); // if both players can be identified,
        // send back duelIds for each so they are saved in ManyToMany relationship.

        if (player1.length === 1 && player2.length === 1) {
          duelIds = [player1[0].playerId, player2[0].playerId];
        } else if (player1.length === 1) {
          playerId = player1[0].playerId;
        } else if (player2.length === 1) {
          playerId = player2[0].playerId;
        }
      }
    } else if (titleLowerCase.includes('duel') || titleLowerCase.includes('battle')) {
      type = 'duel highlights'; // determine id of both players in the duel
      // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE

      var _player1Name = title.split('vs')[0].slice(0, -1);

      var _player2Name = '';

      if (title.split('vs')[1]) {
        _player2Name = "".concat(title.split('vs')[1].split(' ')[1], " ").concat(title.split('vs')[1].split(' ')[2]);
      }

      var _player2 = yield _player7.default.find({
        name: _player1Name
      });

      var _player3 = yield _player7.default.find({
        name: _player2Name
      }); // if both players can be identified,
      // send back duelIds for each so they are saved in ManyToMany relationship.


      if (_player2.length === 1 && _player3.length === 1) {
        duelIds = [_player2[0].playerId, _player3[0].playerId];
      } else if (_player2.length === 1) {
        playerId = _player2[0].playerId;
      } else if (_player3.length === 1) {
        playerId = _player3[0].playerId;
      }
    } else if (titleLowerCase.includes('&')) {
      type = 'team highlights'; // determine id of both players in the duel
      // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE

      var _player1Name2 = title.split('&')[0].slice(0, -1);

      var _player2Name2 = "".concat(title.split('&')[1].split(' ')[1], " ").concat(title.split('&')[1].split(' ')[2]);

      var _player4 = yield _player7.default.find({
        name: _player1Name2
      });

      var _player5 = yield _player7.default.find({
        name: _player2Name2
      }); // if both players can be identified,
      // send back duelIds for each so they are saved in ManyToMany relationship.


      if (_player4.length === 1 && _player5.length === 1) {
        duelIds = [_player4[0].playerId, _player5[0].playerId];
      } else if (_player4.length === 1) {
        playerId = _player4[0].playerId;
      } else if (_player5.length === 1) {
        playerId = _player5[0].playerId;
      }
    } else {
      type = 'highlights';
    }

    return {
      type,
      playerId,
      duelIds
    };
  });
  return _determineVideoTypeFromTitle.apply(this, arguments);
}

function saveVideosToDB(_x2, _x3) {
  return _saveVideosToDB.apply(this, arguments);
}

function _saveVideosToDB() {
  _saveVideosToDB = _asyncToGenerator(function* (videos, matchRecordId) {
    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (resolve) {
        yield (0, _pIteration.forEachSeries)(videos, /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator(function* (video) {
            var exists = yield _youtube2.default.find({
              videoId: video.id.videoId
            });

            if (exists.length === 1) {
              _log.default.info("Video ".concat(video.id.videoId, " exists already, skip"));
            } else {
              _log.default.info("".concat(video.snippet.title));

              _log.default.info("Video doesn't exist, attempting to save video");

              var {
                type,
                playerId,
                duelIds
              } = yield determineVideoTypeFromTitle(video.snippet.title);
              var videoToSave = new _youtube2.default();

              if (playerId) {
                var player1 = yield _player7.default.findOne({
                  playerId
                });
                videoToSave.players.push(player1._id);
              } else if (duelIds) {
                var _player6 = yield _player7.default.findOne({
                  playerId: duelIds[0]
                });

                var player2 = yield _player7.default.findOne({
                  playerId: duelIds[1]
                });
                videoToSave.players.push(_player6._id);
                videoToSave.players.push(player2._id);
              }

              videoToSave.channelTitle = video.snippet.channelTitle;
              videoToSave.channelId = video.snippet.channelId;
              videoToSave.title = video.snippet.title;
              videoToSave.description = video.snippet.description;
              videoToSave.videoId = video.id.videoId;
              videoToSave.videoType = type;
              videoToSave.matchId = matchRecordId;
              videoToSave.publishedAt = new Date(video.snippet.publishedAt);
              videoToSave.publishedAtString = video.snippet.publishedAt;
              videoToSave.thumbnailUrlLarge = video.snippet.thumbnails.high.url;
              videoToSave.thumbnailUrlMedium = video.snippet.thumbnails.medium.url;
              videoToSave.thumbnailUrlSmall = video.snippet.thumbnails.default.url;
              var existingMatch = yield _match.default.findOne({
                matchId: matchRecordId
              });
              videoToSave.match = existingMatch;

              try {
                yield videoToSave.save().then(m => {
                  _log.default.success("Youtube video saved for match ".concat(matchRecordId)); // Update videos list in match


                  existingMatch.videos.push(m._id);
                });
                yield existingMatch.save().then(() => {
                  _log.default.success('Match record update complete...');

                  _log.default.info('----------------------------------');
                }).catch(error => {
                  _log.default.info('Match doesnt exist, didnt start probably...');

                  _log.default.error(error);

                  _log.default.info('----------------------------------');
                });
              } catch (error) {
                _log.default.error('Youtube video doesnt save, see error...');

                _log.default.error(error);
              }
            }
          });

          return function (_x8) {
            return _ref2.apply(this, arguments);
          };
        }());
        resolve();
      });

      return function (_x7) {
        return _ref.apply(this, arguments);
      };
    }());
  });
  return _saveVideosToDB.apply(this, arguments);
}

function findAndSaveYoutubeVideos(_x4, _x5) {
  return _findAndSaveYoutubeVideos.apply(this, arguments);
}

function _findAndSaveYoutubeVideos() {
  _findAndSaveYoutubeVideos = _asyncToGenerator(function* (dateFormatted, channelId) {
    return new Promise( /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (resolve, reject) {
        try {
          _log.default.info('----------------------------------');

          var todaysMatches = yield _match.default.find({
            startDateEastern: dateFormatted
          });

          _log.default.success("Found ".concat(todaysMatches.length, " matches."));

          var teams = yield _team.default.find();
          yield (0, _pIteration.forEachSeries)(todaysMatches, /*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator(function* (match) {
              var hTeam = teams.find(t => t.teamTriCode === match.hTeamTriCode);
              var vTeam = teams.find(t => t.teamTriCode === match.vTeamTriCode);

              if (hTeam && vTeam) {
                if (match.statusNum === 3 && matchNotFresh(match.endTimeUTC)) {
                  _log.default.warning("Match is finished and ".concat(limitHours, "+ hours since ended, dont search for videos"));
                } else if (match.statusNum === 3 && !matchNotFresh(match.endTimeUTC)) {
                  _log.default.default("".concat(hTeam.teamName, " vs ").concat(vTeam.teamName));

                  _log.default.default("Ready to look for videos, match is over but < ".concat(limitHours, " hours since it ended"));

                  var videos = yield (0, _youtube.videoFromChannel)(channelId, "\"".concat(hTeam.teamName, "\"|\"").concat(hTeam.teamShortName, "\"|\"").concat(vTeam.teamName, "\"|\"").concat(vTeam.teamShortName, "\""), (0, _dayjs.default)(match.startTimeUTCString).toISOString());

                  _log.default.success("Found ".concat(videos.items.length, " videos."));

                  if (videos.items.length > 0) {
                    yield saveVideosToDB(videos.items, match.matchId);

                    _log.default.success("Finished saving videos for match: ".concat(match.matchId));

                    _log.default.info('----------------------------------');
                  }
                } else if (match.statusNum === 2) {
                  _log.default.default(hTeam.teamName, vTeam.teamName);

                  _log.default.default('Ready to look for videos, match is active');

                  var _videos = yield (0, _youtube.videoFromChannel)(channelId, "\"".concat(hTeam.teamName, "\"|\"").concat(hTeam.teamShortName, "\"|\"").concat(vTeam.teamName, "\"|\"").concat(vTeam.teamShortName, "\""), (0, _dayjs.default)(match.startTimeUTCString).toISOString());

                  _log.default.success("Found ".concat(_videos.items.length, " videos."));

                  if (_videos.items.length > 0) {
                    yield saveVideosToDB(_videos.items, match.matchId);

                    _log.default.success("Finished saving videos for match: ".concat(match.matchId));

                    _log.default.info('----------------------------------');
                  }
                } else {
                  _log.default.default('Match is not yet active, dont look for youtube videos');
                }
              } else {
                _log.default.default('Team is missing, dont look for youtube videos');
              }
            });

            return function (_x11) {
              return _ref4.apply(this, arguments);
            };
          }());
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      return function (_x9, _x10) {
        return _ref3.apply(this, arguments);
      };
    }());
  });
  return _findAndSaveYoutubeVideos.apply(this, arguments);
}

function main(_x6) {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(function* (dateFormatted) {
    return new Promise( /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (resolve) {
        // YOUTUBE VIDEOS UPDATE
        yield (0, _pIteration.forEachSeries)(_config.ytChannel, /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator(function* (channel) {
            _log.default.title(channel.title);

            yield findAndSaveYoutubeVideos(dateFormatted, channel.id);
          });

          return function (_x13) {
            return _ref6.apply(this, arguments);
          };
        }());
        resolve();
      });

      return function (_x12) {
        return _ref5.apply(this, arguments);
      };
    }());
  });
  return _main.apply(this, arguments);
}

_mongoose.default.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}, (error, connection) => {
  if (error) {
    _log.default.error("Connection error to the database ".concat(process.env.DB_NAME));

    return;
  }

  _log.default.title('Initialization');

  _log.default.info("Connected to the database ".concat(process.env.DB_NAME));

  _log.default.title('Main'); // grab todays games and continue to update


  var todayDate = (0, _dayjs.default)().subtract(1, 'd').format('YYYYMMDD');
  main(todayDate).then(() => {
    _log.default.info('----------------------------------');

    _log.default.info('Closed database connection');

    connection.close(); // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });
});