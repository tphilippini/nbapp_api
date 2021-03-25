"use strict";

var _passport = _interopRequireDefault(require("passport"));

var _passportLocal = require("passport-local");

var _passportGoogleToken = require("passport-google-token");

var _passportFacebookToken = _interopRequireDefault(require("passport-facebook-token"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _uuid = _interopRequireDefault(require("uuid"));

var _log = _interopRequireDefault(require("../helpers/log"));

var _utils = require("../helpers/utils");

var _user3 = _interopRequireDefault(require("../api/users/user.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv').config();

_passport.default.use('local', new _passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password'
}, /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (email, password, done) {
    try {
      _log.default.info('Hi! Passport local verification...');

      var user = yield _user3.default.findOneByEmail(email);
      if (!user) return done('invalid_credentials', false);

      _bcrypt.default.compare(password, user.local.password, (err, isMatch) => {
        if (err) done('invalid_credentials', false);

        if (isMatch) {
          return done(null, user);
        }

        return done('invalid_credentials', false);
      });
    } catch (err) {
      _log.default.error(err.message);

      done('invalid_credentials', false);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()));

_passport.default.use('google', new _passportGoogleToken.Strategy({
  clientID: process.env.API_GOOGLE_CLIENT_ID,
  clientSecret: process.env.API_GOOGLE_CLIENT_SECRET,
  passReqToCallback: true
}, /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (req, token, tokenSecret, profile, done) {
    try {
      _log.default.info('Hi! Passport google verification...');

      if (req.user) {
        _log.default.success('Hi! User already logged in, time for linking...');

        var _user = yield _user3.default.findOneByEmail(req.user.email);

        _user.methods.push('google');

        _user.google = {
          id: profile.id,
          email: profile.emails[0].value
        };
        yield _user.save();
        return done(null, _user);
      }

      var user = yield _user3.default.findOne({
        'google.id': profile.id
      });
      if (user) return done(null, user); // Check if we have someone with the same email

      _log.default.success('Hi! Checking if the user exists...');

      user = yield _user3.default.findOneByEmail(profile.emails[0].value);

      if (user) {
        _log.default.success('Hi! User already exist... Updating account...');

        user.methods.push('google');
        user.google = {
          id: profile.id,
          email: profile.emails[0].value
        };
        yield user.save();
        return done(null, user);
      } // Create a new account


      _log.default.success('Hi! Creating a new user from google verification...');

      var newUser = new _user3.default({
        uuid: _uuid.default.v4(),
        methods: ['google'],
        google: {
          id: profile.id,
          email: profile.emails[0].value
        },
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        alias: (0, _utils.setDefaultAlias)(profile.displayName),
        photo: profile.photos[0].value.replace(/sz=50/gi, 'sz=250')
      });
      yield newUser.save();
      done(null, newUser);
    } catch (err) {
      _log.default.error(err.message);

      done('invalid_credentials', false);
    }
  });

  return function (_x4, _x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}()));

_passport.default.use('facebook', new _passportFacebookToken.default({
  clientID: process.env.API_FACEBOOK_CLIENT_ID,
  clientSecret: process.env.API_FACEBOOK_CLIENT_SECRET,
  passReqToCallback: true
}, /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (req, token, tokenSecret, profile, done) {
    try {
      _log.default.info('Hi! Passport facebook verification...');

      if (req.user) {
        _log.default.success('Hi! User already logged in, time for linking...');

        var _user2 = yield _user3.default.findOneByEmail(req.user.email);

        _user2.methods.push('facebook');

        _user2.facebook = {
          id: profile.id,
          email: profile.emails[0].value
        };
        yield _user2.save();
        return done(null, _user2);
      }

      var user = yield _user3.default.findOne({
        'facebook.id': profile.id
      });
      if (user) return done(null, user); // Check if we have someone with the same email

      _log.default.success('Hi! Checking if the user exists...');

      user = yield _user3.default.findOneByEmail(profile.emails[0].value);

      if (user) {
        _log.default.success('Hi! User already exist... Updating account...');

        user.methods.push('facebook');
        user.facebook = {
          id: profile.id,
          email: profile.emails[0].value
        };
        yield user.save();
        return done(null, user);
      } // Create a new account


      _log.default.success('Hi! Creating a new user from facebook verification...');

      var newUser = new _user3.default({
        uuid: _uuid.default.v4(),
        methods: ['facebook'],
        facebook: {
          id: profile.id,
          email: profile.emails[0].value
        },
        lastName: profile.name.familyName,
        firstName: profile.name.givenName,
        alias: (0, _utils.setDefaultAlias)(profile.displayName),
        photo: profile.photos[0].value
      });
      yield newUser.save();
      done(null, newUser);
    } catch (err) {
      done('invalid_credentials', false);
    }
  });

  return function (_x9, _x10, _x11, _x12, _x13) {
    return _ref3.apply(this, arguments);
  };
}()));

module.exports = _passport.default;