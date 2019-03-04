'use strict'

import UserSchema from '@/schemas/user'
import mongoose from 'mongoose'

class User {
  constructor() {
    this.model = mongoose.model('User', UserSchema, 'User');
  }

  add(data, cb) {
    let newUser = new this.model(data);
    newUser.save((err) => {
      if (err) throw err;

      cb();
    });
  }

  findOneByEmail(data, cb) {
    this.model.findOne({ email: data }, (err, result) => {
      if (err) throw err;

      if (result) {
        cb(result);
      } else {
        cb([]);
      }
    });
  }

  doesThisExist(data, cb) {
    this.model.findOne(data, (err, result) => {
      if (err) throw err;

      if (result) {
        cb(true);
      } else {
        cb(false);
      }
    });
  }
}

export default new User();
