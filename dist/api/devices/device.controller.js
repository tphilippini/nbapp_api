'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _device = _interopRequireDefault(require("./device.model"));

var _response = _interopRequireDefault(require("../../helpers/response"));

var _log = _interopRequireDefault(require("../../helpers/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deviceController = {};

deviceController.patch = (req, res) => {
  _log.default.info('Hi! Editing a device...');

  var {
    revoked,
    name
  } = req.body;
  var code = ''; // Split to avoid callbacks hell

  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!revoked && !name) {
      errors.push('missing_params');
    } else if (revoked && name) {
      errors.push('too_many_params');
    } else {
      _device.default.doesTheDeviceBelongToTheUser([req.params.uuid, req.user.user, req.user.user_type], result => {
        if (result) {
          if (revoked && revoked === 'true') {
            code = 'device_revoked';
            checkEvent.emit('success_revoked');
          } else if (name) {
            code = 'device_name_changed';
            checkEvent.emit('success_name');
          } else {
            errors.push('invalid_param_value');
            checkEvent.emit('error', errors);
          }
        } else {
          errors.push('the_device_does_not_belong_to_the_user');
          checkEvent.emit('error', errors);
        }
      });
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'the_device_does_not_belong_to_the_user') {
      status = 404;
    }

    _response.default.error(res, status, err);
  });
  checking();
  checkEvent.on('success_revoked', () => {
    _device.default.updateOneColumn(['revoked', 1, req.params.uuid, req.user.user, req.user.user_type], () => {
      _response.default.success(res, 200, code, {
        device: {
          revoked: true
        }
      });
    });
  });
  checkEvent.on('success_name', () => {
    _device.default.updateOneColumn(['name', name, req.params.uuid, req.user.user, req.user.user_type], () => {
      _response.default.success(res, 200, code, {
        device: {
          name
        }
      });
    });
  });
};

var _default = deviceController;
exports.default = _default;