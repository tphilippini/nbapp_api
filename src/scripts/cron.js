import cron from 'node-cron';
import execa from 'execa';

import log from '@/helpers/log';
// import loader from '@/helpers/loader';

// Every 10 minutes between the hours of 21:00-00:00 on Sun and Sat
cron.schedule('*/10 19-22 * * 0,6', async () => {
  log.info('Running cron...');
  log.default('Every minute on Sat,Sun from 21:00 to 00:00');
  // loader.start();

  try {
    await execa('npm run prod:update:daily-matches', {
      shell: true,
    });

    log.success('Looks great');
    // loader.stop();
  } catch (e) {
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
  }
});

// Every 10 minutes between the hours of 1:00-9:00
cron.schedule('*/10 5-7 * * *', async () => {
  log.info('Running cron...');
  log.default('Every 10 minutes between the hours of 7:00-9:00');
  // loader.start();

  try {
    await execa('npm run prod:update:daily-matches', {
      shell: true,
    });

    log.success('Looks great');
    // loader.stop();
  } catch (e) {
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
  }
});

// At 30 minutes past 9:00
// cron.schedule('*/10 16-18 * * *', async () => {
//   log.info('Running cron...');
//   log.default('At 30 minutes past 9:00');
//   // loader.start();

//   try {
//     await execa('npm run prod:update:daily-matches', {
//       shell: true,
//     });

//     log.success('Looks great');
//     // loader.stop();
//   } catch (e) {
//     log.error(`Does not look great: ${e.stdout}`);
//     log.error(`ShortMessage : ${e.shortMessage}`);
//   }
// });

// At 30 minutes past 9:00
cron.schedule('30 7 * * *', async () => {
  log.info('Running cron...');
  log.default('At 30 minutes past 9:00');
  // loader.start();

  try {
    await execa('npm run prod:update:evals', {
      shell: true,
    });

    log.success('Looks great');
    // loader.stop();
  } catch (e) {
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
  }
});

// At 10 minutes past 16:00
cron.schedule('10 14 * * *', async () => {
  log.info('Running cron...');
  log.default('At 10 minutes past 16:00');
  // loader.start();

  try {
    await execa('npm run prod:update:daily-matches', {
      shell: true,
    });

    log.success('Looks great');
    // loader.stop();
  } catch (e) {
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
  }
});

// At 10 minutes past 10:00 on the 5th day of every month
cron.schedule('12 8 5 * *', async () => {
  log.info('Running cron...');
  log.default('At 10 minutes past 10:00 on the 5th day of every month');
  // loader.start();

  try {
    await execa('npm run prod:update:teams && npm run prod:update:players', {
      shell: true,
    });

    log.success('Looks great');
    // loader.stop();
  } catch (e) {
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
  }
});

// Every 10 minutes between the hours of 8:00-12:00
// cron.schedule('*/10 7-11 * * *', async () => {
//   log.info('Running cron...');
//   log.default('Every 10 minutes between the hours of 8:00-12:00');
//   loader.start();

//   try {
//     await execa('npm run update:youtube-videos', {
//       shell: true,
//     });

//     log.success('Looks great');
//     loader.stop();
//   } catch (e) {
//     log.error(`Does not look great: ${e.stdout}`);
//     log.error(`ShortMessage : ${e.shortMessage}`);
//   }
// });
