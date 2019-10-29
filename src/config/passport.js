import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';

import log from '@/helpers/log';
import Users from '@/api/users/user.model';

passport.use(
  new LocalStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        log.info('Hi! Passport local verification...');
        const user = await Users.findOneByEmail(email);

        if (!user) done('invalid_credentials', false);

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) done('invalid_credentials', false);

          if (isMatch) {
            done(null, user);
          } else done('invalid_credentials', false);
        });
      } catch (err) {
        done('invalid_credentials', false);
      }
    }
  )
);

module.exports = passport;
