import mongoose from 'mongoose';

const DevicesSchema = new mongoose.Schema(
  {
    id: Number,

    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },

    // userId: { type: String, required: true, index: true },

    userType: String,

    refreshToken: { type: String, unique: true },

    revoked: { type: Boolean, default: false },

    name: {
      type: String,
      lowercase: true,
      required: true,
    },

    ua: {
      type: String,
      lowercase: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Devices = mongoose.model('Devices', DevicesSchema, 'Devices');
export default Devices;
