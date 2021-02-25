'use strict';

import mongoose from 'mongoose';
import log from '@/helpers/log';

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const { connection } = mongoose;
connection.on(
  'error',
  log.error(`Connection error to the database ${process.env.DB_NAME}`)
);
connection.once('open', () => {
  log.success(`Hi! Connected to the database ${process.env.DB_NAME}`);
});

export default connection;
