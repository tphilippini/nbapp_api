import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
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

module.exports = UserSchema;
