'use strict';

import uuid from 'uuid';
import { isEmail } from 'validator';
import bcrypt from 'bcrypt';
import EventEmitter from 'events';
import ua from 'useragent';

import User from '@/api/users/user.model';
import Device from '@/api/devices/device.model';

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

  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const alias = req.body.alias;
  const email = req.body.email;
  const password = req.body.password;

  // Split to avoid callbacks hell
  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!lastName || !firstName || !alias ||
      !email || !password) {
      errors.push('missing_params');
    } else {
      if (!isEmail(email)) {
        errors.push('invalid_email_address');
      } if (password.length < 6) {
        errors.push('password_too_short');
      }

      if (errors.length === 0) {
        User.doesThisExist({ email }, (result) => {
          if (result) {
            errors.push('email_address_already_taken');
            checkEvent.emit('error', errors);
          } else {
            User.doesThisExist({ alias }, (result) => {
              if (result) {
                errors.push('alias_already_taken');
                checkEvent.emit('error', errors);
              } else {
                checkEvent.emit('success');
              }
            });
          }
        });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', (err) => {
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
      const newUser = {
        lastName,
        firstName,
        alias,
        email,
        password: hash,
        uuid: uuid.v4()
      };

      const deviceId = uuid.v4();
      const accessToken = generateAccessToken(deviceId, newUser.uuid, 'user');
      const refreshToken = generateRefreshToken(deviceId);

      User.add(newUser, () => {
        const newDevice = {
          uuid: deviceId,
          userId: newUser.uuid,
          userType: 'user',
          refreshToken: refreshToken,
          name: deviceName,
          ua: uaName
        };

        Device.add(newDevice, () => {
          /**
           * Use Location header to redirect here
           * For next 201 code, we should have the URL relatives to the new ressource
           * Ex: /users/:uuid
           */
          response.successAdd(res, 'user_added', '/auth/token',
            {
              access_token: accessToken,
              token_type: 'bearer',
              expires_in: api().access_token.exp,
              refresh_token: refreshToken,
              client_id: deviceId
            }
          );
        });
      });
    });
  });
};

userController.getAll = (req, res) => {
  log.info('Hi! Getting all of the users...');
  User.getAll((result) => {
    res.json(result);
  });
};

userController.getCurrent = (req, res) => {
  log.info('Hi! Getting current user...');
  res.json({
    user: {
      email: req.user.email,
      alias: req.user.alias
    }
  });
};

export default userController;
