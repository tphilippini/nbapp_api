'use strict';

import mongoose from 'mongoose';

import { db } from '@/config/config';
import log from '@/helpers/log';

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

mongoose.connect(DATABASE_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  }
);

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'Connection error...'));
connection.once('open', function () {
  log.success(`Hi! Connected to the database ${db().name}`);
}); 

export default connection;