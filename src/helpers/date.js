'use strict';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const date = {};

date.dateTime = () => dayjs().tz(date.timeZone()).format();

date.timeZone = () => {
  let timeZone = dayjs.tz.guess();

  if (process.env.API_TIME_ZONE && !!dayjs.tz.zone(process.env.API_TIME_ZONE)) {
    timeZone = process.env.API_TIME_ZONE;
  }

  return timeZone;
};

export default date;
