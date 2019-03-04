'use strict'

import DeviceSchema from '@/schemas/device'
import mongoose from 'mongoose'

class Device {
  constructor() {
    this.model = mongoose.model('Device', DeviceSchema, 'Device');
  }

  add(data, cb) {
    let newDevice = new this.model(data);
    newDevice.save((err) => {
      if (err) throw err;

      cb();
    });
  }
}

export default new Device();
