import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema(
  {
    id: Number,

    uuid: { type: String, required: true, unique: true, index: true },

    lastName: String,

    firstName: String,

    alias: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      unique: true
    },

    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      unique: true,
      index: true
    },

    password: { type: String, required: true },

    confirmed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// UsersSchema.statics.findByName = (name, cb) => {
//   this.find({ alias: new RegExp(name, 'i') }, cb);
// };

UsersSchema.statics.findByAlias = function(alias) {
  return new Promise((resolve, reject) => {
    this.findOne({ alias: new RegExp(alias, 'i') }, (error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    });
  });
};

UsersSchema.statics.findOneByUUID = function(data) {
  return new Promise((resolve, reject) => {
    this.findOne({ uuid: data }, (error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    });
  });
};

UsersSchema.statics.findOneByEmail = function(data) {
  return new Promise((resolve, reject) => {
    this.findOne({ email: data }, (error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    });
  });
};

UsersSchema.statics.getUsers = function() {
  return new Promise((resolve, reject) => {
    this.find((error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    });
  });
};

UsersSchema.statics.doesThisExist = function(data) {
  return new Promise((resolve, reject) => {
    this.findOne(data, (error, res) => {
      if (error) return reject(error);
      if (res) resolve(true);
      else resolve(false);
    });
  });
};

UsersSchema.pre('remove', next => {
  this.model('Devices').deleteMany({ userId: this._id }, next);
});

const Users = mongoose.model('Users', UsersSchema, 'Users');
export default Users;
