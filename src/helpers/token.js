'use strict';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { api } from '@/config/config';

import { timestamp } from '@/helpers/time';

const generateAccessToken = (deviceId, userId, userAlias, userEmail, userType) => {
  const currentTimestamp = timestamp();
  const futureTimestamp = currentTimestamp + api().access_token.exp;

  return jwt.sign({
    iss: 'nbapp',
    exp: futureTimestamp,
    sub: deviceId,
    user: userId,
    email: userEmail,
    alias: userAlias,
    user_type: userType
  }, api().access_token.secret);
};

const generateRefreshToken = deviceId => crypto.createHash('sha1').update((deviceId + api().refresh_token.salt)).digest('hex');

const generateResetToken = (userId, userType) => {
  const currentTimestamp = timestamp();
  const futureTimestamp = currentTimestamp + api().reset_token.exp;

  return jwt.sign({
    iss: 'nbapp',
    exp: futureTimestamp,
    user: userId,
    user_type: userType
  }, api().reset_token.secret);
};

const validateToken = (token, cb) =>
  jwt.verify(token, api().reset_token.secret, (err, decoded) => {
    if (err) return cb(false);
    return cb(true, decoded);
  })
  ;

export {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  validateToken
};
