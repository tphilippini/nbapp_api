import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-plus-token';
import bcrypt from 'bcrypt';
import uuid from 'uuid';

import log from '@/helpers/log';
import Users from '@/api/users/user.model';

passport.use(
  'local',
  new LocalStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        log.info('Hi! Passport local verification...');
        const user = await Users.findOneByEmail(email);

        if (!user) return done('invalid_credentials', false);

        bcrypt.compare(password, user.local.password, (err, isMatch) => {
          if (err) done('invalid_credentials', false);

          if (isMatch) {
            return done(null, user);
          } else return done('invalid_credentials', false);
        });
      } catch (err) {
        log.error(err.message);
        return done('invalid_credentials', false);
      }
    }
  )
);

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID:
        '1084552878641-g34h8a5ukobhd1goc1p57hl0fs1gdsn3.apps.googleusercontent.com',
      clientSecret: '5UF5cRmYYRt-_9b41QYyYO4G'
    },
    async (token, tokenSecret, profile, done) => {
      try {
        log.info('Hi! Passport google verification...');
        const user = await Users.findOne({ 'google.id': profile.id });
        if (user) return done(null, user);

        // Create a new account
        log.success('Hi! Creating a new user from google verification...');
        let alias = '';
        if (profile.displayName) {
          alias = profile.displayName
            .match(/\b(\w)/g)
            .join('')
            .toLowerCase();
        }

        const newUser = new Users({
          uuid: uuid.v4(),
          method: 'google',
          google: {
            id: profile.id,
            email: profile.emails[0].value
          },
          lastName: profile.name.familyName,
          firstName: profile.name.givenName,
          alias: alias,
          photo: profile.photos[0].value
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        log.error(err.message);
        return done('invalid_credentials', false);
      }
    }
  )
);

module.exports = passport;
