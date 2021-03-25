/* eslint-disable consistent-return */

/* eslint-disable no-underscore-dangle */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _uuid = _interopRequireDefault(require("uuid"));

var _events = _interopRequireDefault(require("events"));

var _validator = require("validator");

var _useragent = _interopRequireDefault(require("useragent"));

var _user = _interopRequireDefault(require("../users/user.model"));

var _device = _interopRequireDefault(require("../devices/device.model"));

var _passport = _interopRequireDefault(require("../../config/passport"));

var _validator2 = require("../../helpers/validator");

var _token = require("../../helpers/token");

var _response = _interopRequireDefault(require("../../helpers/response"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _mailer = _interopRequireDefault(require("../../helpers/mailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { runInNewContext } from 'vm';
var authController = {};

authController.post = (req, res) => {
  // TODO: deal with it when mobile is coming (by taking device name as default)
  var deviceName = 'Ordinateur principal';

  var agent = _useragent.default.parse(req.headers['user-agent']);

  var uaName = agent.toString();
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'password') {
        _log.default.info('Hi! Authenticating...');

        var {
          email
        } = req.body;
        var {
          password
        } = req.body;

        if (!email || !password || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            _passport.default.authenticate('local', {
              session: false
            }, (err, user) => {
              if (err) {
                _log.default.error('Hi! Password validation on error...');

                errors.push(err);
                return checkEvent.emit('error', errors);
              }

              _log.default.info('Hi! Generating tokens...');

              return checkEvent.emit('success_password_grant', user);
            })(req, res);
          }
        }
      } else if (grantType === 'refresh_token') {
        _log.default.info('Hi! Refreshing tokens...');

        var refreshToken = req.body.refresh_token;
        var clientId = req.body.client_id;

        if (!refreshToken || !clientId) {
          errors.push('missing_params');
        } else {
          if (!(0, _validator.isUUID)(clientId) || !(0, _validator2.isSha1)(refreshToken)) {
            errors.push('invalid_client');
          }

          if (errors.length === 0) {
            // Devices.doesTheRefreshTokenValid(
            //   [clientId, refreshToken],
            //   result => {
            //     if (result.length > 0) {
            //       checkEvent.emit('success_refresh_token_grant', result[0]);
            //     } else {
            //       errors.push('invalid_client');
            //       checkEvent.emit('error', errors);
            //     }
            //   }
            // );
            errors.push('invalid_client');
            return checkEvent.emit('error', errors);
          }
        }
      } else {
        errors.push('invalid_grant_type');
      }
    }

    if (errors.length > 0) {
      return checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_password_grant', result => {
    var deviceId = _uuid.default.v4();

    var refreshToken = (0, _token.generateRefreshToken)(deviceId);
    var accessToken = (0, _token.generateAccessToken)(deviceId, result.uuid, result.alias, result.local.email, userType);
    var device = new _device.default({
      uuid: deviceId,
      userId: result._id,
      userType,
      refreshToken,
      name: deviceName,
      ua: uaName
    });
    device.save(err => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      } // TODO Use "let" when other model is available


      var code = 'user_authenticated';

      _response.default.success(res, 200, code, {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: parseInt(process.env.API_ACCESS_TOKEN_EXP, 10),
        refresh_token: refreshToken,
        client_id: deviceId,
        uuid: result.uuid,
        email: result.local.email,
        alias: result.alias,
        firstName: result.firstName,
        lastName: result.lastName,
        methods: result.methods,
        fid: result.facebook.id || undefined,
        gid: result.google.id || undefined
      });
    });
  });
  checkEvent.on('success_refresh_token_grant', result => {
    var deviceId = _uuid.default.v4();

    var newAccessToken = (0, _token.generateAccessToken)(deviceId, result.userId, result.userType);
    var newRefreshToken = (0, _token.generateRefreshToken)(deviceId);
    console.log('update refresh token', newAccessToken, newRefreshToken);
    /* Device.updateRefreshToken(
      [newRefreshToken, result.refreshToken, result.uuid],
      () => {
        response.success(res, 200, 'tokens_updated', {
          access_token: newAccessToken,
          token_type: 'bearer',
          expires_in: parseInt(process.env.API_ACCESS_TOKEN_EXP, 10),
          refresh_token: newRefreshToken,
          client_id: result.uuid
        });
      }
    );
    */
  });
  checking();
};

authController.google = (req, res) => {
  var deviceName = 'Ordinateur principal';

  var agent = _useragent.default.parse(req.headers['user-agent']);

  var uaName = agent.toString();
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'google') {
        _log.default.info('Hi! Authenticating...');

        var token = req.body.access_token;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            _passport.default.authenticate('google', {
              session: false
            }, (err, user) => {
              if (err) {
                _log.default.error('Hi! Password google validation on error...');

                _log.default.error(err);

                errors.push('invalid_credentials');
                return checkEvent.emit('error', errors);
              }

              _log.default.info('Hi! Generating tokens...');

              return checkEvent.emit('success_google_grant', user);
            })(req, res);
          }
        }
      }
    }

    if (errors.length > 0) {
      return checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_google_grant', result => {
    var deviceId = _uuid.default.v4();

    var refreshToken = (0, _token.generateRefreshToken)(deviceId);
    var accessToken = (0, _token.generateAccessToken)(deviceId, result.uuid, result.alias, result.google.email, userType);
    var device = new _device.default({
      uuid: deviceId,
      userId: result._id,
      userType,
      refreshToken,
      name: deviceName,
      ua: uaName
    });
    device.save(err => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      } // TODO Use "let" when other model is available


      var code = 'user_authenticated';

      _response.default.success(res, 200, code, {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        client_id: deviceId,
        uuid: result.uuid,
        email: result.google.email,
        alias: result.alias,
        firstName: result.firstName,
        lastName: result.lastName,
        methods: result.methods,
        fid: result.facebook.id || undefined,
        gid: result.google.id || undefined
      });
    });
  });
  checking();
};

authController.facebook = (req, res) => {
  var deviceName = 'Ordinateur principal';

  var agent = _useragent.default.parse(req.headers['user-agent']);

  var uaName = agent.toString();
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'facebook') {
        _log.default.info('Hi! Authenticating...');

        var token = req.body.access_token;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            _passport.default.authenticate('facebook', {
              session: false
            }, (err, user) => {
              if (err) {
                _log.default.error('Hi! Password facebook validation on error...');

                errors.push(err);
                return checkEvent.emit('error', errors);
              }

              _log.default.info('Hi! Generating tokens...');

              return checkEvent.emit('success_facebook_grant', user);
            })(req, res);
          }
        }
      }
    }

    if (errors.length > 0) {
      return checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_facebook_grant', result => {
    var deviceId = _uuid.default.v4();

    var refreshToken = (0, _token.generateRefreshToken)(deviceId);
    var accessToken = (0, _token.generateAccessToken)(deviceId, result.uuid, result.alias, result.facebook.email, userType);
    var device = new _device.default({
      uuid: deviceId,
      userId: result._id,
      userType,
      refreshToken,
      name: deviceName,
      ua: uaName
    });
    device.save(err => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      } // TODO Use "let" when other model is available


      var code = 'user_authenticated';

      _response.default.success(res, 200, code, {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: parseInt(process.env.API_ACCESS_TOKEN_EXP, 10),
        refresh_token: refreshToken,
        client_id: deviceId,
        uuid: result.uuid,
        email: result.facebook.email,
        alias: result.alias,
        firstName: result.firstName,
        lastName: result.lastName,
        methods: result.methods,
        photo: result.photo
      });
    });
  });
  checking();
};

authController.validate = (req, res) => {
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'validate') {
        _log.default.info('Hi! Validating token...');

        var {
          token
        } = req.body;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          (0, _token.validateToken)(token, result => {
            if (result) {
              checkEvent.emit('success_validate_grant');
            } else {
              errors.push('invalid_access_token');
              checkEvent.emit('error', errors);
            }
          });
        }
      } else {
        errors.push('invalid_grant_type');
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_access_token') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_validate_grant', () => {
    _response.default.success(res, 200, 'user_confirmed');
  });
  checking();
};

authController.reset = (req, res) => {
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'reset') {
        _log.default.info('Hi! Reseting password...');

        var {
          token
        } = req.body;
        var {
          password
        } = req.body;
        var confirmPassword = req.body.confirm_password;

        if (!token || !userType || !password || !confirmPassword) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (password.length < 6) {
            errors.push('password_too_short');
          }

          if (password !== confirmPassword) {
            errors.push('password_must_match');
          }

          if (errors.length === 0) {
            _log.default.info('Hi! Validating token...');

            (0, _token.validateToken)(token, (result, decoded) => {
              if (result && decoded) {
                _user.default.findOneByUUID(decoded.user).then(u => {
                  if (u) {
                    _bcrypt.default.hash(password, 12, (err, hash) => {
                      if (err) throw err;

                      if (hash) {
                        u.local.password = hash;
                        checkEvent.emit('success_reset_grant', u);
                      } else {
                        errors.push('invalid_credentials');
                        checkEvent.emit('error', errors);
                      }
                    });
                  } else {
                    errors.push('invalid_credentials');
                    checkEvent.emit('error', errors);
                  }
                }).catch(() => {
                  errors.push('invalid_access_token');
                  checkEvent.emit('error', errors);
                });
              } else {
                errors.push('invalid_access_token');
                checkEvent.emit('error', errors);
              }
            });
          }
        }
      } else {
        errors.push('invalid_grant_type');
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_access_token') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_reset_grant', result => {
    var user = new _user.default(result);
    user.save(err => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      }

      _response.default.success(res, 200, 'password_updated');
    });
  });
  checking();
};

authController.forgot = (req, res) => {
  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'forgot') {
        _log.default.info('Hi! Send reset link password...');

        var {
          email
        } = req.body;

        if (!email || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            _user.default.findOneByEmail(email).then(result => {
              if (result) {
                checkEvent.emit('success_forgot_grant', result);
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
      } else {
        errors.push('invalid_grant_type');
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    var status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_forgot_grant', result => {
    var resetToken = (0, _token.generateResetToken)(result.uuid, userType);
    result.link = "//".concat(process.env.APP_HOST, ":").concat(process.env.APP_PORT, "/reset/").concat(resetToken);
    console.log(result.link);

    _mailer.default.sendResetPasswordEmail(result, err => {
      if (err) _response.default.error(res, 400, ['mailer_failed']);

      _log.default.success('Hi! Reset password email sent...');

      _response.default.success(res, 200, 'user_forgot');
    });
  });
  checking();
};

var _default = authController;
exports.default = _default;