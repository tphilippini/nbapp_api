'use strict';

import uuid from 'uuid';
import { isEmail, isUUID } from 'validator';
import bcrypt from 'bcrypt';
import EventEmitter from 'events';
import ua from 'useragent';

import Users from '@/api/users/user.model';
import Devices from '@/api/devices/device.model';

import { api } from '@/config/config';
import { generateAccessToken, generateRefreshToken } from '@/helpers/token';
import response from '@/helpers/response';
import log from '@/helpers/log';
import os from '@/helpers/os';

const userController = {};

userController.post = (req, res) => {
  log.info('Hi! Adding a user...');

  const deviceName = os.get().type;
  const agent = ua.parse(req.headers['user-agent']);
  const uaName = agent.toString();

  const alias = req.body.alias;
  const email = req.body.email;
  const password = req.body.password;

  // Split to avoid callbacks hell
  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!alias || !email || !password) {
      errors.push('missing_params');
    } else {
      if (!isEmail(email)) {
        errors.push('invalid_email_address');
      }
      if (password.length < 6) {
        errors.push('password_too_short');
      }

      if (errors.length === 0) {
        Users.doesThisExist({ email, method: 'local' })
          .then(result => {
            if (result) {
              errors.push('email_address_already_taken');
              checkEvent.emit('error', errors);
            } else {
              Users.doesThisExist({ alias })
                .then(result => {
                  if (result) {
                    errors.push('alias_already_taken');
                    checkEvent.emit('error', errors);
                  } else {
                    checkEvent.emit('success');
                  }
                })
                .catch(() => {
                  errors.push('alias_already_taken');
                  checkEvent.emit('error', errors);
                });
            }
          })
          .catch(() => {
            errors.push('email_address_already_taken');
            checkEvent.emit('error', errors);
          });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    response.error(res, 400, err);
  });

  checking();

  checkEvent.on('success', () => {
    /**
     * Generate password with 2^12 (4096) iterations for the algo.
     * Safety is priority here, performance on the side in this case
     * Become slower, but this is to "prevent" more about brute force attacks.
     * It will take more time during matching process, then more time to reverse it
     */
    bcrypt.hash(password, 12, (err, hash) => {
      let user = new Users({
        method: 'local',
        alias,
        'local.email': email,
        'local.password': hash,
        uuid: uuid.v4()
      });

      const deviceId = uuid.v4();
      const refreshToken = generateRefreshToken(deviceId);
      const accessToken = generateAccessToken(
        deviceId,
        user.uuid,
        alias,
        email,
        'user'
      );

      user.save(err => {
        if (err) {
          let errors = [];
          errors.push(err);
          response.error(res, 500, errors);
        }

        let device = new Devices({
          uuid: deviceId,
          userId: user._id,
          userType: 'user',
          refreshToken: refreshToken,
          name: deviceName,
          ua: uaName
        });

        device.save(err => {
          if (err) {
            let errors = [];
            errors.push(err);
            response.error(res, 500, errors);
          }
          /**
           * Use Location header to redirect here
           * For next 201 code, we should have the URL relatives to the new ressource
           * Ex: /users/:uuid
           */
          response.successAdd(res, 'user_added', '/auth/token', {
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: api().access_token.exp,
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
  log.info('Hi! Editing an user...');

  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push('missing_params');
    } else {
      const allowedUserTypes = ['user'];

      if (grantType === 'update') {
        log.info('Hi! Updating...');

        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const alias = req.body.alias;
        const uuid = req.params.uuid;

        if (!lastName || !firstName || !alias || !uuid || !userType) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }
          if (!isUUID(uuid)) {
            errors.push('invalid_client');
          }
          if (alias.length < 4) {
            errors.push('alias_too_short');
          }

          if (errors.length === 0) {
            Users.findOneByUUID(uuid)
              .then(result => {
                if (result && result.uuid == uuid) {
                  Users.doesThisExist({ alias, uuid: { $ne: uuid } })
                    .then(exists => {
                      if (exists) {
                        errors.push('alias_already_taken');
                        checkEvent.emit('error', errors);
                      } else {
                        result.alias = alias;
                        result.firstName = firstName;
                        result.lastName = lastName;

                        checkEvent.emit('success_update_grant', result);
                      }
                    })
                    .catch(() => {
                      errors.push('invalid_credentials');
                      checkEvent.emit('error', errors);
                    });
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
      } else if (grantType === 'password') {
        log.info('Hi! Updating password...');

        const password = req.body.password;
        const newPassword = req.body.new_password;
        const confirmPassword = req.body.confirm_password;
        const uuid = req.params.uuid;

        if (
          !password ||
          !newPassword ||
          !confirmPassword ||
          !uuid ||
          !userType
        ) {
          errors.push('missing_params');
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push('invalid_user_type');
          }
          if (!isUUID(uuid)) {
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
            Users.findOneByUUID(uuid)
              .then(result => {
                if (result && result.uuid == uuid) {
                  log.info('Hi! Comparing password...');
                  bcrypt.compare(
                    password,
                    result.local.password,
                    (err, isMatch) => {
                      if (err) throw err;

                      if (isMatch) {
                        log.info('Hi! Updating new password...');
                        checkEvent.emit(
                          'success_update_password_grant',
                          result,
                          newPassword
                        );
                      } else {
                        errors.push('invalid_credentials');
                        checkEvent.emit('error', errors);
                      }
                    }
                  );
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
      } else if (grantType === 'confirmed') {
        log.info('Hi! Updating confirmation...');
      } else {
        errors.push('invalid_grant_type');
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    let status = 400;
    response.error(res, status, err);
  });

  checking();

  checkEvent.on('success_update_grant', result => {
    let user = new Users(result);
    user.save((err, u) => {
      if (err) {
        let errors = [];
        errors.push(err);
        response.error(res, 500, errors);
      }

      response.success(res, 200, 'user_updated', {
        uuid: u.uuid,
        email: u.local.email,
        alias: u.alias,
        firstName: u.firstName,
        lastName: u.lastName
      });
    });
  });

  checkEvent.on('success_update_password_grant', (result, newPassword) => {
    bcrypt.hash(newPassword, 12, (err, hash) => {
      result.local.password = hash;

      let user = new Users(result);
      user.save((err, u) => {
        if (err) {
          let errors = [];
          errors.push(err);
          response.error(res, 500, errors);
        }

        response.success(res, 200, 'user_updated', {
          uuid: u.uuid,
          email: u.local.email,
          alias: u.alias,
          firstName: u.firstName,
          lastName: u.lastName
        });
      });
    });
  });
};

// userController.getAll = (req, res) => {
//   log.info('Hi! Getting all of the users...');

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
  log.info('Hi! Getting current user...');

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    const alias = req.user.alias;
    const email = req.user.email;

    if (!alias || !email) {
      errors.push('missing_params');
    } else {
      if (!isEmail(email)) {
        errors.push('invalid_email_address');
      }
      if (alias.length < 4) {
        errors.push('alias_too_short');
      }

      if (errors.length === 0) {
        Users.findOneByEmail(email)
          .then(result => {
            if (result && result.local.email == email) {
              console.log();
              checkEvent.emit('success_current_user', result);
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

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    let status = 400;
    response.error(res, status, err);
  });

  checking();

  checkEvent.on('success_current_user', result => {
    response.success(res, 200, 'user_confirmed', {
      uuid: result.uuid,
      email: result.local.email,
      alias: result.alias,
      firstName: result.firstName,
      lastName: result.lastName
    });
  });
};

export default userController;
