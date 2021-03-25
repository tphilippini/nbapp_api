"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _pIteration = require("p-iteration");

var _log = _interopRequireDefault(require("../../helpers/log"));

var _team = _interopRequireDefault(require("../../api/teams/team.model"));

var _nba = require("../api/nba");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

function grabTeams() {
  return _grabTeams.apply(this, arguments);
}

function _grabTeams() {
  _grabTeams = _asyncToGenerator(function* () {
    // TEAMS
    _log.default.info('Finding teams...');

    var teams = yield (0, _nba.findTeams)();

    _log.default.info("Teams found : ".concat(teams.length));

    yield (0, _pIteration.forEachSeries)(teams, /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (team) {
        if (team.isNBAFranchise) {
          var teamToSave = yield _team.default.findOne({
            teamId: team.teamId
          });

          if (teamToSave) {
            _log.default.info('----------------------------------');

            _log.default.info("".concat(team.fullName));

            _log.default.info('Team exists, updating the record now...');

            teamToSave.isNBAFranchise = team.isNBAFranchise;
            teamToSave.city = team.city;
            teamToSave.teamId = team.teamId;
            teamToSave.teamName = team.fullName;
            teamToSave.teamShortName = team.urlName;
            teamToSave.teamTriCode = team.tricode;
            teamToSave.confName = team.confName;
            teamToSave.divName = team.divName;

            try {
              var existingTeam = new _team.default(teamToSave);
              yield existingTeam.updateOne(teamToSave).then(() => {
                _log.default.success('Team updated...');
              });
            } catch (error) {
              _log.default.error('Team doesnt update, see error...');

              _log.default.error(error);
            }
          } else {
            _log.default.info('----------------------------------');

            _log.default.info("".concat(team.fullName));

            _log.default.info('Team doesnt exist, creating new record now...');

            var newTeam = {
              isNBAFranchise: team.isNBAFranchise,
              city: team.city,
              teamId: team.teamId,
              teamName: team.fullName,
              teamShortName: team.urlName,
              teamTriCode: team.tricode,
              confName: team.confName,
              divName: team.divName
            };

            try {
              var t = new _team.default(newTeam);
              yield t.save().then(() => {
                _log.default.success('Team saved...');
              });
            } catch (error) {
              _log.default.error('Team doesnt save, see error...');

              _log.default.error(error);
            }
          }
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    var count = yield _team.default.estimatedDocumentCount({});

    _log.default.info('----------------------------------');

    _log.default.info('----------------------------------');

    _log.default.success("".concat(count, " Teams save/update complete..."));
  });
  return _grabTeams.apply(this, arguments);
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(function* () {
    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // TEAMS
          yield grabTeams();
          resolve();
        } catch (error) {
          _log.default.error('Team doesnt save, see error...');

          _log.default.error(error);

          reject();
        }
      });

      return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
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

  _log.default.title('Main');

  main().then(() => {
    _log.default.info('----------------------------------');

    _log.default.info('Closed database connection');

    connection.close(); // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });
});