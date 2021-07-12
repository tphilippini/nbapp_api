'use strict';

import logger from './logger';

const log = {};

log.success = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.log('\x1b[32m✔ %s\x1b[0m', value);
  }
  return logger.info(value);
};

log.info = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.info('\x1b[36m➡ %s\x1b[0m', value);
  }
  return logger.info(value);
};

log.error = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.error('\x1b[31m✖ %s\x1b[0m', value);
  }
  return logger.error(value);
};

log.warning = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.warn('\x1b[33m❗ %s\x1b[0m', value);
  }
  return logger.warn(value);
};

log.title = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.log(
      '\n---\n\n\x1b[7m.: %s :.\x1b[0m\n',
      value.toUpperCase()
    );
  }
  return logger.info(value);
};

log.default = (value) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.log('%s', value);
  }
  return logger.info(value);
};

export default log;
