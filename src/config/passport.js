import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-token';
import FacebookStrategy from 'passport-facebook-token';
import bcrypt from 'bcrypt';
import uuid from 'uuid';

import log from '@/helpers/log';
import { setDefaultAlias } from '@/helpers/utils';
import Users from '@/api/users/user.model';

passport.use(
  'local',
  new LocalStrategy(
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
        done('invalid_credentials', false);
      }
    }
  )
);

passport.use(
  'google-token',
  new GoogleStrategy(
    {
      clientID:
        '1084552878641-8fga50e1ln4uf9ujvfk9roucau9b06oo.apps.googleusercontent.com',
      clientSecret: 'pq-ueFhu5CKwGuZu6Srr7DPM'
    },
    async (token, tokenSecret, profile, done) => {
      try {
        log.info('Hi! Passport google verification...');
        let user = await Users.findOne({ 'google.id': profile.id });
        if (user) return done(null, user);

        // Check if we have someone with the same email
        log.success('Hi! Checking if the user exists...');
        user = await Users.findOneByEmail(profile.emails[0].value);
        if (user) {
          log.success('Hi! User already exist... Updating account...');
          user.google = {
            id: profile.id,
            email: profile.emails[0].value
          };
          await user.save();
          return done(null, user);
        }

        // Create a new account
        log.success('Hi! Creating a new user from google verification...');
        const newUser = new Users({
          uuid: uuid.v4(),
          method: 'google',
          google: {
            id: profile.id,
            email: profile.emails[0].value
          },
          lastName: profile.name.familyName,
          firstName: profile.name.givenName,
          alias: setDefaultAlias(profile.displayName),
          photo: profile.photos[0].value.replace(/sz=50/gi, 'sz=250')
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        log.error(err.message);
        done('invalid_credentials', false);
      }
    }
  )
);

passport.use(
  'facebook',
  new FacebookStrategy(
    {
      clientID: '409923532968639',
      clientSecret: '30e90841a59303de1dbdf53621bd22ab'
    },
    async (token, tokenSecret, profile, done) => {
      try {
        log.info('Hi! Passport facebook verification...');
        let user = await Users.findOne({ 'facebook.id': profile.id });
        if (user) return done(null, user);

        // Check if we have someone with the same email
        log.success('Hi! Checking if the user exists...');
        user = await Users.findOneByEmail(profile.emails[0].value);
        if (user) {
          log.success('Hi! User already exist... Updating account...');
          user.facebook = {
            id: profile.id,
            email: profile.emails[0].value
          };
          await user.save();
          return done(null, user);
        }

        // Create a new account
        log.success('Hi! Creating a new user from facebook verification...');
        const newUser = new Users({
          uuid: uuid.v4(),
          method: 'facebook',
          facebook: {
            id: profile.id,
            email: profile.emails[0].value
          },
          lastName: profile.name.familyName,
          firstName: profile.name.givenName,
          alias: setDefaultAlias(profile.displayName),
          photo: profile.photos[0].value
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done('invalid_credentials', false);
      }
    }
  )
);

module.exports = passport;
