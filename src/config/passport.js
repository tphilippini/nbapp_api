const mongoose = require('mongoose');
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';

// const Users = mongoose.model('Users');

console.log('hello in passport config');
passport.use(
  new LocalStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      // console.log('IN PASSPORT', User);
      return done(null, 'toctoc', 'blabla');

      // User.findOne({ email })
      //   .then(user => {
      //     /*bcrypt.compare(password, user.password, (err, isMatch) => {
      //       if (err) {
      //         return done(null, false, {
      //           errors: 'invalid_credentials'
      //         });
      //       }
      //       if (isMatch) {
      //         return done(null, user);
      //       } else {
      //         return done(null, false, {
      //           errors: 'invalid_credentials'
      //         });
      //       }
      //     });
      //     */
      //     console.log('IN PASSPORT', user);
      //     return done(null, 'coucou', 'blabla');
      //   })
      //   .catch(done);
    }
  )
);

// console.log(passport);

module.exports = passport;
