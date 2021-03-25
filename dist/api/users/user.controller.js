/* eslint-disable consistent-return */

/* eslint-disable no-underscore-dangle */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _uuid3 = _interopRequireDefault(require("uuid"));

var _validator = require("validator");

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _events = _interopRequireDefault(require("events"));

var _useragent = _interopRequireDefault(require("useragent"));

var _user = _interopRequireDefault(require("./user.model"));

var _device = _interopRequireDefault(require("../devices/device.model"));

var _token = require("../../helpers/token");

var _response = _interopRequireDefault(require("../../helpers/response"));

var _log = _interopRequireDefault(require("../../helpers/log"));

var _os = _interopRequireDefault(require("../../helpers/os"));

var _passport = _interopRequireDefault(require("../../config/passport"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userController = {};

userController.post = (req, res) => {
  _log.default.info('Hi! Adding a user...');

  var deviceName = _os.default.get().type;

  var agent = _useragent.default.parse(req.headers['user-agent']);

  var uaName = agent.toString();
  var {
    alias,
    email,
    password
  } = req.body; // Split to avoid callbacks hell

  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!alias || !email || !password) {
      errors.push('missing_params');
    } else {
      if (!(0, _validator.isEmail)(email)) {
        errors.push('invalid_email_address');
      }

      if (password.length < 6) {
        errors.push('password_too_short');
      }

      if (errors.length === 0) {
        _user.default.findOneByEmail(email).then(result => {
          if (result) {
            if (result.local.email === email) {
              errors.push('email_address_already_taken');
              checkEvent.emit('error', errors);
            } else {
              _log.default.info('Hi! Existing social user, merge with this account...');

              result.local.email = email;
              result.alias = alias;
              result.methods.push('local');
              checkEvent.emit('success', result);
            }
          } else {
            _user.default.doesThisExist({
              alias
            }).then(result => {
              if (result) {
                errors.push('alias_already_taken');
                checkEvent.emit('error', errors);
              } else {
                var user = new _user.default({
                  methods: ['local'],
                  alias,
                  'local.email': email,
                  uuid: _uuid3.default.v4()
                });
                checkEvent.emit('success', user);
              }
            }).catch(() => {
              errors.push('alias_already_taken');
              checkEvent.emit('error', errors);
            });
          }
        }).catch(() => {
          errors.push('missing_params');
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
  checking();
  checkEvent.on('success', user => {
    /**
     * Generate password with 2^12 (4096) iterations for the algo.
     * Safety is priority here, performance on the side in this case
     * Become slower, but this is to "prevent" more about brute force attacks.
     * It will take more time during matching process, then more time to reverse it
     */
    _bcrypt.default.hash(password, 12, (err, hash) => {
      user.local.password = hash;

      var deviceId = _uuid3.default.v4();

      var refreshToken = (0, _token.generateRefreshToken)(deviceId);
      var accessToken = (0, _token.generateAccessToken)(deviceId, user.uuid, alias, email, 'user');
      user.save(err => {
        if (err) {
          var errors = [];
          errors.push(err);

          _response.default.error(res, 500, errors);
        }

        var device = new _device.default({
          uuid: deviceId,
          userId: user._id,
          userType: 'user',
          refreshToken,
          name: deviceName,
          ua: uaName
        });
        device.save(err => {
          if (err) {
            var _errors = [];

            _errors.push(err);

            _response.default.error(res, 500, _errors);
          }
          /**
           * Use Location header to redirect here
           * For next 201 code, we should have the URL relatives to the new ressource
           * Ex: /users/:uuid
           */


          _response.default.successAdd(res, 'user_added', '/auth/token', {
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: parseInt(process.env.API_ACCESS_TOKEN_EXP, 10),
            refresh_token: refreshToken,
            client_id: deviceId,
            email,
            alias
          });
        });
      });
    });
  });
};

userController.patch = (req, res) => {
  _log.default.info('Hi! Editing an user...');

  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'update') {
        _log.default.info('Hi! Updating...');

        var {
          firstName
        } = req.body;
        var {
          lastName
        } = req.body;
        var {
          alias
        } = req.body;
        var {
          uuid: _uuid
        } = req.params;

        if (!lastName || !firstName || !alias || !_uuid || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (!(0, _validator.isUUID)(_uuid)) {
            errors.push('invalid_client');
          }

          if (alias.length < 4) {
            errors.push('alias_too_short');
          }

          if (errors.length === 0) {
            _user.default.findOneByUUID(_uuid).then(result => {
              if (result && result.uuid === _uuid) {
                _user.default.doesThisExist({
                  alias,
                  uuid: {
                    $ne: _uuid
                  }
                }).then(exists => {
                  if (exists) {
                    errors.push('alias_already_taken');
                    checkEvent.emit('error', errors);
                  } else {
                    result.alias = alias;
                    result.firstName = firstName;
                    result.lastName = lastName;
                    checkEvent.emit('success_update_grant', result);
                  }
                }).catch(() => {
                  errors.push('invalid_credentials');
                  checkEvent.emit('error', errors);
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
      } else if (grantType === 'password') {
        _log.default.info('Hi! Updating password...');

        var {
          password
        } = req.body;
        var newPassword = req.body.new_password;
        var confirmPassword = req.body.confirm_password;
        var {
          uuid: _uuid2
        } = req.params;

        if (!password || !newPassword || !confirmPassword || !_uuid2 || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (!(0, _validator.isUUID)(_uuid2)) {
            errors.push('invalid_client');
          }

          if (password.length < 6) {
            errors.push('password_too_short');
          }

          if (newPassword.length < 6) {
            errors.push('new_password_too_short');
          }

          if (newPassword !== confirmPassword) {
            errors.push('password_must_match');
          }

          if (errors.length === 0) {
            _user.default.findOneByUUID(_uuid2).then(result => {
              if (result && result.uuid === _uuid2 && result.local.password) {
                _log.default.info('Hi! Comparing password...');

                _bcrypt.default.compare(password, result.local.password, (err, isMatch) => {
                  if (err) throw err;

                  if (isMatch) {
                    _log.default.info('Hi! Updating new password...');

                    checkEvent.emit('success_update_password_grant', result, newPassword);
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
              errors.push('invalid_credentials');
              checkEvent.emit('error', errors);
            });
          }
        }
      } else if (grantType === 'confirmed') {
        _log.default.info('Hi! Updating confirmation...');
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

    _response.default.error(res, status, err);
  });
  checkEvent.on('success_update_grant', result => {
    var user = new _user.default(result);
    user.save((err, u) => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      }

      _response.default.success(res, 200, 'user_updated', {
        uuid: u.uuid,
        email: u.local.email || u.facebook.email || u.google.email,
        alias: u.alias,
        firstName: u.firstName,
        lastName: u.lastName,
        methods: u.methods,
        fid: u.facebook.id || undefined,
        gid: u.google.id || undefined
      });
    });
  });
  checkEvent.on('success_update_password_grant', (result, newPassword) => {
    _bcrypt.default.hash(newPassword, 12, (err, hash) => {
      result.local.password = hash;
      var user = new _user.default(result);
      user.save((err, u) => {
        if (err) {
          var errors = [];
          errors.push(err);

          _response.default.error(res, 500, errors);
        }

        _response.default.success(res, 200, 'user_updated', {
          uuid: u.uuid,
          email: u.local.email || u.facebook.email || u.google.email,
          alias: u.alias,
          firstName: u.firstName,
          lastName: u.lastName,
          methods: u.methods,
          fid: u.facebook.id || undefined,
          gid: u.google.id || undefined
        });
      });
    });
  });
  checking();
}; // userController.getAll = (req, res) => {
//   log.info("Hi! Getting all of the users...");
//   console.log(process.env.API_ACCESS_TOKEN_SECRET);
//   res.json({ code: 200, message: "GetAll Test" });
//   // Users.create({
//   //   alias: 'A',
//   //   uuid: 30,
//   //   email: 'a@foo.bar',
//   //   password: '123456'
//   // });
//   // Users.create({
//   //   alias: 'B',
//   //   uuid: 28,
//   //   email: 'b@foo.bar',
//   //   password: '123456'
//   // });
//   // Users.find({}, (err, result) => {
//   //   console.log(err);
//   //   console.log(result);
//   // });
//   Users.findByName('B')
//     .then(docs => {
//       res.json(docs);
//     })
//     .catch(err => {
//       console.error(err);
//     });
//   //   // Verify grant_type admin, not fetch all user like that
//   //   User.getAll(result => {
//   //     res.json(result);
//   //   });
// };


userController.getCurrent = (req, res) => {
  _log.default.info('Hi! Getting current user...');

  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];
    var {
      alias
    } = req.user;
    var {
      email
    } = req.user;

    if (!alias || !email) {
      errors.push('missing_params');
    } else {
      if (!(0, _validator.isEmail)(email)) {
        errors.push('invalid_email_address');
      }

      if (alias.length < 4) {
        errors.push('alias_too_short');
      }

      if (errors.length === 0) {
        _user.default.findOneByEmail(email).then(result => {
          if (result && (result.local.email === email || result.facebook.email === email || result.google.email === email)) {
            checkEvent.emit('success_current_user', result);
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
    var status = 400;

    _response.default.error(res, status, err);
  });
  checking();
  checkEvent.on('success_current_user', result => {
    _response.default.success(res, 200, 'user_confirmed', {
      uuid: result.uuid,
      email: result.local.email || result.facebook.email || result.google.email,
      alias: result.alias,
      firstName: result.firstName,
      lastName: result.lastName,
      methods: result.methods,
      fid: result.facebook.id || undefined,
      gid: result.google.id || undefined
    });
  });
};

userController.linkAccount = (req, res) => {
  _log.default.info('Hi! Linking user to social account...');

  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'link') {
        _log.default.info('Hi! Linking...');

        var {
          method
        } = req.params;
        var token = req.body.access_token;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (!['google', 'facebook'].includes(method)) {
            errors.push('invalid_method');
          }

          if (errors.length === 0) {
            _passport.default.authorize(method, {
              session: false
            }, (err, user) => {
              if (err) {
                _log.default.error("Hi! Linking ".concat(method, " account on error..."));

                _log.default.error(err);

                errors.push('invalid_credentials');
                return checkEvent.emit('error', errors);
              }

              _log.default.info("Hi! Linking ".concat(method, " account..."));

              return checkEvent.emit('success_social_link', user);
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
  checkEvent.on('success_social_link', result => {
    _response.default.success(res, 200, 'user_updated', {
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
  checking();
};

userController.unlinkAccount = (req, res) => {
  _log.default.info('Hi! Unlinking user to social account...');

  var grantType = req.body.grant_type;
  var userType = req.body.user_type;
  var checkEvent = new _events.default();

  var checking = () => {
    var errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      var allowedUserTypes = ['user'];

      if (grantType === 'unlink') {
        _log.default.info('Hi! Unlinking...');

        var {
          method
        } = req.params;
        var {
          email
        } = req.user;

        if (!userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (!['google', 'facebook'].includes(method)) {
            errors.push('invalid_method');
          }

          if (errors.length === 0) {
            _user.default.findOneByEmail(email).then(user => {
              if (user) {
                var position = user.methods.indexOf(method);
                if (position >= 0) user.methods.splice(position, 1);
                if (user[method]) user[method] = undefined;
                checkEvent.emit('success_social_unlink', user);
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
        checkEvent.emit('error', errors);
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
  checkEvent.on('success_social_unlink', result => {
    result.save((err, u) => {
      if (err) {
        var errors = [];
        errors.push(err);

        _response.default.error(res, 500, errors);
      }

      _response.default.success(res, 200, 'user_updated', {
        uuid: u.uuid,
        email: u.local.email || u.facebook.email || u.google.email,
        alias: u.alias,
        firstName: u.firstName,
        lastName: u.lastName,
        methods: u.methods,
        fid: u.facebook.id || undefined,
        gid: u.google.id || undefined
      });
    });
  });
  checking();
};

var _default = userController;
exports.default = _default;