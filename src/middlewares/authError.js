'use strict';

import response from '@/helpers/response';
import log from '@/helpers/log';

const authErrorMidd = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    response.error(res, 401, ['invalid_access_token']);
    log.error('Request invalid access token');
  } else {
    log.success('Request with access token valid');
    next();
  }
};

export default authErrorMidd;
