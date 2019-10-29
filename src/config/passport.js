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
    (email, password, done) => {
      log.info('Hi! Passport local verification...');
      Users.findOneByEmail(email)
        .then(user => {
          if (user) {
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) done('invalid_credentials');

              if (isMatch) {
                done(null, user);
              } else done('invalid_credentials');
            });
          } else done('invalid_credentials');
        })
        .catch(err => {
          log.error(err);
          done('invalid_credentials');
        });
    }
  )
);

module.exports = passport;
