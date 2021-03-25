/* eslint-disable no-underscore-dangle */

/* eslint-disable nonblock-statement-body-position */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _uuid = _interopRequireDefault(require("uuid"));

var _validator = require("validator");

var _events = _interopRequireDefault(require("events"));

var _user = _interopRequireDefault(require("../users/user.model"));

var _league = _interopRequireDefault(require("./league.model"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _response = _interopRequireDefault(require("../../helpers/response"));

var _utils = require("../../helpers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var leagueController = {};

leagueController.getByUser = (req, res) => {
  _log.default.info('Hi! Getting leagues...');

  var {
    uuid
  } = req.params;
  var {
    user
  } = req;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!uuid || !user.email || !user.user) {
      errors.push('missing_params');
    } else {
      if (!(0, _validator.isUUID)(uuid)) {
        errors.push('invalid_client');
      }

      if (errors.length === 0) {
        _user.default.findOneByUUID(uuid).then(result => {
          if (result && result.uuid === user.user) {
            _league.default.findLeaguesByObjectId(result._id).then(leagues => {
              if (leagues.length > 0) {
                checkEvent.emit('success', 'result_found', leagues);
              } else checkEvent.emit('success', 'result_empty', []);
            });
          } else {
            errors.push('invalid_credentials');
            checkEvent.emit('error', errors);
          }
        }).catch(() => {
          errors.push('invalid_credentials');
          checkEvent.emit('error', errors);
        });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    _response.default.error(res, 400, err);
  });
  checkEvent.on('success', (code, result) => {
    _response.default.success(res, 200, code, ...result);
  });
  checking();
};

leagueController.post = (req, res) => {
  _log.default.info('Hi! Adding a league...'); // Creation de son equipe

  /**
   *  playerId,
   *  leagueId,
   *  name,
   *  shortName: {
        type: String,
        required: [true, "can't be blank"],
        minLength: [3, "Name is too short!"],
        maxLength: 3,
        match: [/^[-a-zA-Z0-9]+$/, "is invalid"]
      },
      roster: [ objectId, 'players'] //objet contenant les 6 joueurs de son équipe
      points
    */


  var uuid = req.user.user;
  var {
    name
  } = req.body;
  var {
    weeks
  } = req.body;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!uuid || !name || !weeks) {
      errors.push('missing_params');
    } else {
      if (!(0, _validator.isUUID)(uuid)) {
        errors.push('invalid_client');
      }

      if (errors.length === 0) {
        _user.default.findOneByUUID(uuid).then(result => {
          var league = new _league.default({
            name,
            weeks,
            leagueId: _uuid.default.v4(),
            ownerId: result._id,
            password: (0, _utils.generatePassword)()
          });
          league.players.push(result._id);
          checkEvent.emit('success', league);
        }).catch(() => {
          errors.push('invalid_credentials');
          checkEvent.emit('error', errors);
        });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    _response.default.error(res, 400, err);
  });
  checkEvent.on('success', league => {
    league.save(err => {
      if (err) {
        var errors = [];
        errors.push('missing_params');

        _response.default.error(res, 500, errors);
      }

      _response.default.success(res, 200, 'league_added', {
        id: league.leagueId
      });
    });
  });
  checking();
};

var _default = leagueController;
exports.default = _default;