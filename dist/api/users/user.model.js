"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable array-callback-return */

/* eslint-disable consistent-return */

/* eslint-disable func-names */
var UsersSchema = new _mongoose.default.Schema({
  id: Number,
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  lastName: String,
  firstName: String,
  alias: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/^[-a-zA-Z0-9]+$/, 'is invalid'],
    unique: true
  },
  photo: String,
  methods: {
    type: [String],
    required: true
  },
  local: {
    email: {
      type: String,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: {
      type: String
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  google: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid']
    }
  },
  facebook: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid']
    }
  }
}, {
  timestamps: true
}); // UsersSchema.statics.findByName = (name, cb) => {
//   this.find({ alias: new RegExp(name, 'i') }, cb);
// };

UsersSchema.statics.findByAlias = function (alias) {
  return new Promise((resolve, reject) => {
    this.findOne({
      alias: new RegExp(alias, 'i')
    }, (error, docs) => {
      if (error) {
        return reject(error);
      }

      resolve(docs);
    });
  });
};

UsersSchema.statics.findOneByUUID = function (data) {
  return new Promise((resolve, reject) => {
    this.findOne({
      uuid: data
    }, (error, docs) => {
      if (error) {
        return reject(error);
      }

      resolve(docs);
    });
  });
};

UsersSchema.statics.findOneByEmail = function (data) {
  return new Promise((resolve, reject) => {
    this.findOne({
      $or: [{
        'local.email': data
      }, {
        'google.email': data
      }, {
        'facebook.email': data
      }]
    }, (error, user) => {
      if (error) return reject(error);
      resolve(user);
    });
  });
};

UsersSchema.statics.getUsers = function () {
  return new Promise((resolve, reject) => {
    this.find((error, users) => {
      if (error) return reject(error);
      resolve(users);
    });
  });
};

UsersSchema.statics.doesThisExist = function (data) {
  return new Promise((resolve, reject) => {
    this.findOne(data, (error, res) => {
      if (error) return reject(error);
      if (res) resolve(true);else resolve(false);
    });
  });
};

UsersSchema.pre('remove', next => {
  (void 0).model('Devices').deleteMany({
    userId: (void 0)._id
  }, next);
});

var Users = _mongoose.default.model('Users', UsersSchema, 'Users');

var _default = Users;
exports.default = _default;