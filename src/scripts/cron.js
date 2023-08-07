import cron from 'node-cron';
import execa from 'execa';
import loader from '@/helpers/loader';
import log from '@/helpers/log';

// Every 10 minutes between the hours of 21:00-00:00 on Sun and Sat
cron.schedule(
  '*/10 21-23 * * 0,6',
  async () => {
    log.success(
      'Running a job every 10 minutes on Sat,Sun from 9pm to 12pm at Europe/Paris timezone'
    );
    loader.start();
    try {
      await execa('pnpm run prod:update:daily-matches', {
        shell: true,
      });

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

// Every 10 minutes between the hours of 0:00-9:00
cron.schedule(
  '*/10 0-9 * * *',
  async () => {
    log.success(
      'Running a job every 10 minutes from 12am to 9am at Europe/Paris timezone'
    );
    loader.start();
    try {
      await execa('pnpm run prod:update:daily-matches', {
        shell: true,
      });

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

// At 10 minutes past 9:00
cron.schedule(
  '10 9 * * *',
  async () => {
    log.success('Running a job at 9:10am at Europe/Paris timezone');
    loader.start();
    try {
      await execa('pnpm run prod:update:evals', {
        shell: true,
      });

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

// At 10 minutes past 16:00
cron.schedule(
  '30 16 * * *',
  async () => {
    log.success('Running a job at 4:30pm at Europe/Paris timezone');
    loader.start();
    try {
      await execa('pnpm run prod:update:daily-matches', {
        shell: true,
      });

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

// At 10 minutes past 10:00 on the 5th day of every month
cron.schedule(
  '10 10 5 * *',
  async () => {
    log.success(
      'Running a job at 10 minutes past 10am on the 5th day of every month at Europe/Paris timezone'
    );
    loader.start();
    try {
      await execa(
        'pnpm run prod:update:teams && pnpm run prod:update:players',
        {
          shell: true,
        }
      );

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

// Every 10 minutes between the hours of 8:00-12:00
cron.schedule(
  '*/10 8-12 * * *',
  async () => {
    log.success(
      'Running a job every 10min from 8am to 12am at Europe/Paris timezone'
    );
    loader.start();
    try {
      await execa('pnpm run prod:update:youtube-videos', {
        shell: true,
      });

      log.success('Looks great');
      loader.stop();
    } catch (e) {
      log.error(`Does not look great: ${e.stdout}`);
      log.error(`ShortMessage : ${e.shortMessage}`);
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);
