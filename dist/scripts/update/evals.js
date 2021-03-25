"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _axios = _interopRequireDefault(require("axios"));

var _pIteration = require("p-iteration");

var _log = _interopRequireDefault(require("../../helpers/log"));

var _nba = require("../api/nba");

var _player = _interopRequireDefault(require("../../api/players/player.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(function* () {
    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (resolve) {
        _log.default.info('Finding players...'); // const players = await Players.find({ playerId: 203507 });


        var players = yield _player.default.find();

        _log.default.info("Todays players found : ".concat(players.length));

        if (players.length > 0) {
          yield (0, _pIteration.forEachSeries)(players, /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (player) {
              try {
                _log.default.info('----------------------------------');

                _log.default.info('Player exists, updating the record now...');

                var uri = "http://data.nba.net/data/10s/prod/v1/2019/players/".concat(player.playerId, "_profile.json"); // log.success(uri);

                var profile = yield _axios.default.get(uri);
                var {
                  latest
                } = profile.data.league.standard.stats;
                player.efficiency = (0, _nba.calcEfficiency)(latest);
                player.notation = (0, _nba.calcNotation)(player.efficiency);

                try {
                  var existingPlayer = new _player.default(player);
                  yield existingPlayer.updateOne(player).then(() => {
                    _log.default.success('Player efficiency updated...');
                  });
                } catch (error) {
                  _log.default.error('Player doesnt update, see error...');

                  _log.default.error(error);
                }

                _log.default.info('----------------------------------');
              } catch (error) {
                _log.default.error(error);
              }
            });

            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          }());

          _log.default.info('----------------------------------');

          _log.default.success('Players evals save/update complete...');
        }

        resolve();
      });

      return function (_x) {
        return _ref.apply(this, arguments);
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

  main(connection).then(() => {
    _log.default.info('----------------------------------');

    _log.default.info('Closed database connection');

    connection.close(); // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });
});