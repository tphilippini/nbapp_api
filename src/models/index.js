import mongoose from 'mongoose';
import Users from '@/models/user';
import Devices from '@/models/device';

import { db } from '@/config/config';

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

const connectDb = () => {
  return mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
};

const models = { Users, Devices };
export { connectDb };

export default models;
