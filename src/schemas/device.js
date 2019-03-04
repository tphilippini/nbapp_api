import mongoose from 'mongoose'

const DeviceSchema = new mongoose.Schema({

  id: Number,

  uuid: { type: String, required: true, unique: true, index: true },
  
  userId: { type: String, required: true, index: true },

  userType: String,
  
  refreshToken: { type: String, unique: true },

  revoked: { type: Boolean, default: false },

  name: {
    type: String,
    lowercase: true,
    required: true
  },

  ua: {
    type: String,
    lowercase: true,
    required: true
  }

}, { timestamps: true });

module.exports = DeviceSchema;
