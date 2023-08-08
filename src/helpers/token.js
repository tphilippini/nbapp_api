/* eslint-disable implicit-arrow-linebreak */

'use strict';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { timestamp } from '@/helpers/time';

const generateAccessToken = (
  deviceId,
  userId,
  userAlias,
  userEmail,
  userType
) =>
  jwt.sign(
    {
      iss: 'nbapp',
      sub: deviceId,
      user: userId,
      email: userEmail,
      alias: userAlias,
      user_type: userType,
    },
    process.env.API_ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.API_ACCESS_TOKEN_EXP }
  );

const generateRefreshToken = (deviceId) =>
  crypto
    .createHash('sha1')
    .update(deviceId + process.env.API_REFRESH_TOKEN_SALT)
    .digest('hex');

const generateResetToken = (userId, userType) => {
  const currentTimestamp = timestamp();
  const futureTimestamp =
    currentTimestamp + parseInt(process.env.API_RESET_TOKEN_EXP, 10);

  return jwt.sign(
    {
      iss: 'nbapp',
      user: userId,
      exp: futureTimestamp,
      user_type: userType,
    },
    process.env.API_RESET_TOKEN_SECRET
  );
};

const generateSignUpToken = (userId, userType) => {
  const currentTimestamp = timestamp();
  const futureTimestamp =
    currentTimestamp + parseInt(process.env.API_SIGNUP_TOKEN_EXP, 10);

  return jwt.sign(
    {
      iss: 'nbapp',
      user: userId,
      exp: futureTimestamp,
      user_type: userType,
    },
    process.env.API_SIGNUP_TOKEN_SECRET
  );
};

const validateToken = (data, cb) => {
  let secret;

  if (data.type === 'reset') secret = process.env.API_RESET_TOKEN_SECRET;
  else if (data.type === 'signup') secret = process.env.API_SIGNUP_TOKEN_SECRET;

  jwt.verify(data.token, secret, (err, decoded) => {
    if (err) return cb(false);
    return cb(true, decoded);
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateSignUpToken,
  validateToken,
};
