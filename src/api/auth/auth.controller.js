/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */

'use strict';

import EventEmitter from 'events';
import bcrypt from 'bcryptjs';
import { isUUID } from 'validator';
import ua from 'useragent';
import { v4 as uuidv4 } from 'uuid';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  validateToken,
} from '@/helpers/token';

import Devices from '@/api/devices/device.model';
import Users from '@/api/users/user.model';
import { isSha1 } from '@/helpers/validator';
import log from '@/helpers/log';
import mailer from '@/helpers/mailer';
import passport from '@/config/passport';
import response from '@/helpers/response';

const authController = {};

authController.post = (req, res) => {
  // TODO: deal with it when mobile is coming (by taking device name as default)
  const deviceName = 'Ordinateur principal';

  const agent = ua.parse(req.headers['user-agent']);
  const uaName = agent.toString();

  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'password') {
        log.info('Hi! Authenticating...');

        const { email } = req.body;
        const { password } = req.body;

        if (!email || !password || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            passport.authenticate('local', { session: false }, (err, user) => {
              if (err) {
                log.error('Hi! Password validation on error...');
                errors.push(err);
                return checkEvent.emit('error', errors);
              }

              log.info('Hi! Generating tokens...');
              return checkEvent.emit('success_password_grant', user);
            })(req, res);
          }
        }
      } else if (grantType === 'refresh_token') {
        log.info('Hi! Refreshing tokens...');

        const refreshToken = req.body.refresh_token;
        const clientId = req.body.client_id;

        if (!refreshToken || !clientId) {
          errors.push('missing_params');
        } else {
          if (!isUUID(clientId) || !isSha1(refreshToken)) {
            errors.push('invalid_client');
          }

          if (errors.length === 0) {
            Devices.doesTheRefreshTokenValid(clientId, refreshToken)
              .then((device) => {
                if (device) {
                  checkEvent.emit('success_refresh_token_grant', device);
                } else {
                  errors.push('invalid_client');
                  checkEvent.emit('error', errors);
                }
              })
              .catch(() => {
                errors.push('invalid_client');
                checkEvent.emit('error', errors);
              });
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_password_grant', async (result) => {
    const deviceId = uuidv4();
    const refreshToken = generateRefreshToken(deviceId);
    const accessToken = generateAccessToken(
      deviceId,
      result.uuid,
      result.alias,
      result.local.email,
      userType
    );

    const existingDevice = await Devices.findOne({
      userId: result._id,
      name: deviceName,
      revoked: 0,
    });

    if (existingDevice) {
      log.info('Hi! Updating existing device...');
      existingDevice.uaName = uaName;
      existingDevice.uuid = deviceId;
      existingDevice.refreshToken = refreshToken;

      const device = new Devices(existingDevice);
      await device.updateOne(existingDevice);
    } else {
      log.info('Hi! Creating new device...');
      const device = new Devices({
        uuid: deviceId,
        userId: result._id,
        userType,
        refreshToken,
        name: deviceName,
        ua: uaName,
      });

      await device.save((err) => {
        if (err) {
          const errors = [];
          errors.push(err);
          response.error(res, 500, errors);
        }
      });
    }

    // TODO Use "let" when other model is available
    const code = 'user_authenticated';

    response.success(res, 200, code, {
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
      gid: result.google.id || undefined,
    });
  });

  checkEvent.on('success_refresh_token_grant', async (result) => {
    const deviceId = uuidv4();
    const email =
      result.userId.local.email ||
      result.userId.facebook.id ||
      result.userId.google.id;

    const newAccessToken = generateAccessToken(
      deviceId,
      result.userId.uuid,
      result.userId.alias,
      email,
      result.userType
    );
    const newRefreshToken = generateRefreshToken(deviceId);

    log.info('Hi! Updating existing device...');
    const existingDevice = await Devices.findOne({
      uuid: result.uuid,
    });
    existingDevice.refreshToken = newRefreshToken;
    const device = new Devices(existingDevice);
    await device.updateOne(existingDevice);

    // TODO Use "let" when other model is available
    const code = 'tokens_updated';

    response.success(res, 200, code, {
      access_token: newAccessToken,
      token_type: 'bearer',
      expires_in: parseInt(process.env.API_ACCESS_TOKEN_EXP, 10),
      refresh_token: newRefreshToken,
      client_id: result.uuid,
    });
  });

  checking();
};

authController.google = (req, res) => {
  const deviceName = 'Ordinateur principal';

  const agent = ua.parse(req.headers['user-agent']);
  const uaName = agent.toString();

  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'google') {
        log.info('Hi! Authenticating...');

        const token = req.body.access_token;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            passport.authenticate('google', { session: false }, (err, user) => {
              if (err) {
                log.error('Hi! Password google validation on error...');
                log.error(err);
                errors.push('invalid_credentials');
                return checkEvent.emit('error', errors);
              }

              log.info('Hi! Generating tokens...');
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_google_grant', async (result) => {
    const deviceId = uuidv4();
    const refreshToken = generateRefreshToken(deviceId);
    const accessToken = generateAccessToken(
      deviceId,
      result.uuid,
      result.alias,
      result.google.email,
      userType
    );

    const existingDevice = await Devices.findOne({
      userId: result._id,
      name: deviceName,
      revoked: 0,
    });

    if (existingDevice) {
      log.info('Hi! Updating existing device...');
      existingDevice.uaName = uaName;
      existingDevice.uuid = deviceId;
      existingDevice.refreshToken = refreshToken;

      const device = new Devices(existingDevice);
      await device.updateOne(existingDevice);
    } else {
      log.info('Hi! Creating new device...');
      const device = new Devices({
        uuid: deviceId,
        userId: result._id,
        userType,
        refreshToken,
        name: deviceName,
        ua: uaName,
      });

      await device.save((err) => {
        if (err) {
          const errors = [];
          errors.push(err);
          response.error(res, 500, errors);
        }
      });
    }

    // TODO Use "let" when other model is available
    const code = 'user_authenticated';

    response.success(res, 200, code, {
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
      gid: result.google.id || undefined,
    });
  });

  checking();
};

authController.facebook = (req, res) => {
  const deviceName = 'Ordinateur principal';

  const agent = ua.parse(req.headers['user-agent']);
  const uaName = agent.toString();

  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'facebook') {
        log.info('Hi! Authenticating...');

        const token = req.body.access_token;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            passport.authenticate(
              'facebook',
              { session: false },
              (err, user) => {
                if (err) {
                  log.error('Hi! Password facebook validation on error...');
                  errors.push(err);
                  return checkEvent.emit('error', errors);
                }

                log.info('Hi! Generating tokens...');
                return checkEvent.emit('success_facebook_grant', user);
              }
            )(req, res);
          }
        }
      }
    }

    if (errors.length > 0) {
      return checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_facebook_grant', async (result) => {
    const deviceId = uuidv4();
    const refreshToken = generateRefreshToken(deviceId);
    const accessToken = generateAccessToken(
      deviceId,
      result.uuid,
      result.alias,
      result.facebook.email,
      userType
    );

    const existingDevice = await Devices.findOne({
      userId: result._id,
      name: deviceName,
      revoked: 0,
    });

    if (existingDevice) {
      log.info('Hi! Updating existing device...');
      existingDevice.uaName = uaName;
      existingDevice.uuid = deviceId;
      existingDevice.refreshToken = refreshToken;

      const device = new Devices(existingDevice);
      await device.updateOne(existingDevice);
    } else {
      log.info('Hi! Creating new device...');
      const device = new Devices({
        uuid: deviceId,
        userId: result._id,
        userType,
        refreshToken,
        name: deviceName,
        ua: uaName,
      });

      await device.save((err) => {
        if (err) {
          const errors = [];
          errors.push(err);
          response.error(res, 500, errors);
        }
      });
    }

    // TODO Use "let" when other model is available
    const code = 'user_authenticated';

    response.success(res, 200, code, {
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
      gid: result.google.id || undefined,
    });
  });

  checking();
};

authController.validate = (req, res) => {
  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'validate') {
        log.info('Hi! Validating token...');

        const { token, type } = req.body;

        if (!token || !type || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (type !== 'reset' && type !== 'signup') {
            errors.push('missing_params');
          }

          validateToken({ type, token }, (result) => {
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_access_token') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_validate_grant', () => {
    response.success(res, 200, 'user_confirmed');
  });

  checking();
};

authController.reset = (req, res) => {
  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'reset') {
        log.info('Hi! Reseting password...');

        const { token } = req.body;
        const { password } = req.body;
        const confirmPassword = req.body.confirm_password;

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
            log.info('Hi! Validating token...');
            console.log(token);
            validateToken({ type: 'reset', token }, (result, decoded) => {
              if (result && decoded) {
                Users.findOneByUUID(decoded.user)
                  .then((u) => {
                    if (u) {
                      bcrypt.hash(password, 12, (err, hash) => {
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
                  })
                  .catch(() => {
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_access_token') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_reset_grant', (result) => {
    result.save((err) => {
      if (err) {
        const errors = [];
        errors.push(err);
        console.error(err);
        response.error(res, 500, 'invalid_param_value');
      }

      response.success(res, 200, 'password_updated');
    });
  });

  checking();
};

authController.forgot = (req, res) => {
  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'forgot') {
        log.info('Hi! Send reset link password...');

        const { email } = req.body;

        if (!email || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            Users.findOneByEmail(email)
              .then((result) => {
                if (result) {
                  checkEvent.emit('success_forgot_grant', result);
                } else {
                  errors.push('invalid_credentials');
                  checkEvent.emit('error', errors);
                }
              })
              .catch(() => {
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_credentials') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_forgot_grant', (result) => {
    const resetToken = generateResetToken(result.uuid, userType);
    result.link = `${process.env.APP_HOST}/auth/reset/${resetToken}`;

    // console.log(result, result.link);

    if (!result.methods.includes('local')) {
      response.error(res, 400, ['invalid_email_address']);
    }

    mailer.sendResetPasswordEmail(result, (err) => {
      if (err) {
        response.error(res, 400, ['mailer_failed']);
      } else {
        log.success('Hi! Reset password email sent...');
        response.success(res, 200, 'user_forgot');
      }
    });
  });

  checking();
};

authController.confirm = (req, res) => {
  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'confirm') {
        log.info('Hi! Confirming local signup...');

        const { token } = req.body;

        if (!token || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }

          if (errors.length === 0) {
            log.info('Hi! Validating token...');
            validateToken({ type: 'signup', token }, (result, decoded) => {
              if (result && decoded) {
                Users.findOneByUUID(decoded.user)
                  .then((u) => {
                    if (u) {
                      u.local.confirmed = true;
                      checkEvent.emit('success_confirm_grant', u);
                    } else {
                      errors.push('invalid_credentials');
                      checkEvent.emit('error', errors);
                    }
                  })
                  .catch(() => {
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

  checkEvent.on('error', (err) => {
    let status = 400;

    if (err[0] === 'invalid_access_token') {
      status = 401;
    }

    response.error(res, status, err);
  });

  checkEvent.on('success_confirm_grant', (result) => {
    result.save((err) => {
      if (err) {
        const errors = [];
        errors.push(err);
        console.error(err);
        response.error(res, 500, 'invalid_param_value');
      }

      response.success(res, 200, 'user_confirmed');
    });
  });

  checking();
};

export default authController;
