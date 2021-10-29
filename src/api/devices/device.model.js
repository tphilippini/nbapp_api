/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import Users from '@/api/users/user.model';

const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);

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

// AND DATE_ADD(created_at, INTERVAL ${api().refresh_token.exp} SECOND) >= NOW()
DevicesSchema.statics.doesTheRefreshTokenValid = function (
  clientId,
  refreshToken
) {
  return new Promise((resolve, reject) => {
    const end = dayjs
      .duration(process.env.API_REFRESH_TOKEN_EXP, 'd')
      // .duration(10, 'm')
      .asMilliseconds();
    this.findOne(
      {
        uuid: clientId,
        refreshToken,
        revoked: 0,
        updatedAt: {
          $gt: new Date(Date.now() - end),
        },
      },
      (error, device) => {
        if (error) return reject(error);
        return resolve(device);
      }
    ).populate({
      path: 'userId',
      select: '-_id -__v',
      populate: { path: 'users', select: '-_id -__v' },
    });
  });
};

const Devices = mongoose.model('Devices', DevicesSchema, 'Devices');
export default Devices;
