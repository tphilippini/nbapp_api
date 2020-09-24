'use strict';

import 'jest-extended';

jest.setTimeout(60000);

process.env.API_HOST = 'http://localhost';
process.env.API_PORT = 1338;
process.env.API_VERSION = '/v1';
