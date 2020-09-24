'use strict';

import dotenv from 'dotenv';
import Server from '@/config/server';

(async () => {
  dotenv.config();

  await Server.init();
})();
