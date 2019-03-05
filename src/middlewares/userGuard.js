'use strict';

import response from '@/helpers/response';

const userGuardMidd = (req, res, next) => {
  if (req.user) {
    if (req.user.user_type !== 'user') {
      response.error(res, 403, ['insufficient_rights']);
    } else {
      next();
    }
  }
};

export default userGuardMidd;
