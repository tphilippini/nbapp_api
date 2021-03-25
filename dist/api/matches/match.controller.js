'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _match = _interopRequireDefault(require("./match.model"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _response = _interopRequireDefault(require("../../helpers/response"));

var _validator = require("../../helpers/validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchController = {};

matchController.matchByDate = (req, res) => {
  _log.default.info('Hi! Getting matches...');

  var date = req.params.startDate;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!date) {
      errors.push('missing_params');
    } else {
      if (!(0, _validator.isValidDate)(date, 'YYYYMMDD')) {
        errors.push('invalid_param_value');
      }

      if (errors.length === 0) {
        _match.default.findMatchesByStartDate(date).then(matches => {
          if (matches.length > 0) {
            checkEvent.emit('success', 'result_found', matches);
          } else checkEvent.emit('success', 'result_empty', []);
        }).catch(err => {
          console.log(err);
          errors.push('invalid_param_value');
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

var _default = matchController;
exports.default = _default;