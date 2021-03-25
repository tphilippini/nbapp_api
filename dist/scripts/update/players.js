"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _pIteration = require("p-iteration");

var _dayjs = _interopRequireDefault(require("dayjs"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _team = _interopRequireDefault(require("../../api/teams/team.model"));

var _player2 = _interopRequireDefault(require("../../api/players/player.model"));

var _nba = require("../api/nba");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

function grabPlayerNames() {
  return _grabPlayerNames.apply(this, arguments);
}

function _grabPlayerNames() {
  _grabPlayerNames = _asyncToGenerator(function* () {
    // const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
    // Players
    _log.default.info('Finding players...');

    var players = yield (0, _nba.checkPlayers)();
    console.log("Players found : ".concat(players.length));
    yield (0, _pIteration.forEachSeries)(players, /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (player) {
        if (!player.isActive) return;
        var playerToSave = yield _player2.default.findOne({
          playerId: player.personId
        });
        var team = yield _team.default.findOneByTeamId(player.teamId);

        if (playerToSave) {
          _log.default.info('----------------------------------');

          _log.default.info('Player exists, updating the record now...');

          playerToSave.name = "".concat(player.firstName, " ").concat(player.lastName);
          playerToSave.firstName = player.firstName;
          playerToSave.lastName = player.lastName;
          playerToSave.number = player.jersey;
          playerToSave.position = player.pos;
          playerToSave.height = "".concat(player.heightFeet, "-").concat(player.heightInches);
          playerToSave.heightMeters = player.heightMeters;
          playerToSave.weight = player.weightPounds;
          playerToSave.weightKgs = player.weightKilograms;
          playerToSave.birthdate = (0, _dayjs.default)(player.dateOfBirthUTC).format('MMM DD, YYYY');
          playerToSave.age = (0, _dayjs.default)().diff(player.dateOfBirthUTC, 'years');
          playerToSave.playerId = player.personId;
          playerToSave.teamId = team.teamId;
          playerToSave.teamName = team.teamName;
          playerToSave.teamTriCode = team.teamTriCode;

          try {
            var existingPlayer = new _player2.default(playerToSave);
            yield existingPlayer.updateOne(playerToSave).then(() => {
              _log.default.success('Player updated...');
            });
          } catch (error) {
            _log.default.error('Player doesnt update, see error...');

            _log.default.error(error);
          }
        } else {
          _log.default.info('----------------------------------');

          _log.default.info('Player doesnt exist, creating new record now...');

          var newPlayer = {
            name: "".concat(player.firstName, " ").concat(player.lastName),
            firstName: player.firstName,
            lastName: player.lastName,
            number: player.jersey,
            position: player.pos,
            height: "".concat(player.heightFeet, "-").concat(player.heightInches),
            heightMeters: player.heightMeters,
            weight: player.weightPounds,
            weightKgs: player.weightKilograms,
            birthdate: (0, _dayjs.default)(player.dateOfBirthUTC).format('MMM DD, YYYY'),
            age: (0, _dayjs.default)().diff(player.dateOfBirthUTC, 'years'),
            playerId: player.personId,
            teamId: team.teamId,
            teamName: team.teamName,
            teamTriCode: team.teamTriCode
          };

          try {
            var _player = new _player2.default(newPlayer);

            yield _player.save().then(() => {
              _log.default.success('Player saved...');
            });
          } catch (error) {
            _log.default.error('Player doesnt save, see error...');

            _log.default.error(error);
          }
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    var count = yield _player2.default.estimatedDocumentCount({});

    _log.default.info("Total players saved : ".concat(count));

    _log.default.info('----------------------------------');
  });
  return _grabPlayerNames.apply(this, arguments);
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(function* () {
    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (resolve, reject) {
        try {
          // PLAYERS
          yield grabPlayerNames();
          resolve();
        } catch (error) {
          _log.default.error('Player doesnt save, see error...');

          _log.default.error(error);

          reject(error);
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
    _log.default.info('Closed database connection');

    connection.close(); // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });
});