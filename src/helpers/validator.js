'use strict';

import dayjs from 'dayjs';

const regex = {
  uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
  date: {
    yyyymmdd: '20[0-9]{2}[0-9]{2}[0-9]{2}',
    // yyyymmdd: "[0-9]{4}-0[1-9]|1[0-2](0[1-9]|[1-2][0-9]|3[0-1])"
  },
  hash: {
    sha1: '[a-f0-9]{40}',
  },
};

const isSha1 = (value) => value.match(new RegExp(regex.hash.sha1)) !== null;

const isValidDate = (date, format) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  dayjs(date, format).format(format) === date;

export { regex, isSha1, isValidDate };
