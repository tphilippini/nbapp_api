'use strict';

import Server from './config/server';
// eslint-disable-next-line import/order
import dotenv from 'dotenv';

(async () => {
  dotenv.config();

  await Server.init();
})();
