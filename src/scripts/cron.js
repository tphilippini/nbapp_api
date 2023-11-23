// import { exec } from 'child_process';
import cron from 'node-cron';
// import loader from '@/helpers/loader';
import log from '@/helpers/log';
import mailer from '@/helpers/mailer';

// Every minute for test
// https://dashboard.render.com/web/srv-cj8gcd5jeehc73c0iang/logs
// Running in TZ UTC, so 16h in Paris is 14h UTC. (03 14 * * *)
// '*/10 0-9 * * *', Running everyday from 2h in the morning FR to 11h France
// cron.schedule('* * * * *', async () => {
//   log.success('Running a job test');
// });
// https://dev.to/documatic/send-email-in-nodejs-with-nodemailer-using-gmail-account-2gd1
// cron.schedule(
//   '45 10 * * *',
//   () => {
//     console.log('Running a job at 20:45 at Europe/Paris timezone');

//     mailer.sendTest({ name: 'Thomas' }, (err) => {
//       if (err) {
//         console.log('[mailer_failed] - sendTest');
//         console.log(err);
//       } else {
//         console.log('Hi! mail sent...');
//       }
//     });
//   },
//   {
//     scheduled: true,
//     timezone: 'Europe/Paris',
//   }
// );

cron.schedule(
  '15 7 * * *',
  () => {
    log.success('Running a job test');
    mailer.sendTest({ name: 'Thomas P' }, (err) => {
      if (err) {
        console.log('[mailer_failed] - sendTest');
        console.log(err);
      } else {
        console.log('Hi! mail sent...');
      }
    });
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
);

cron.schedule('* * * * *', async () => {
  log.success('Running a job test');
});

// At 10 minutes past 7:00
// cron.schedule('10 7 * * *', async () => {
//   log.success('Running a job at 9:10am at Europe/Paris timezone');
//   loader.start();
//   try {
//     await exec('pnpm run prod:update:daily-matches');
//     log.success('Looks great');
//     loader.stop();
//   } catch (e) {
//     log.error(`Does not look great: ${e.stdout}`);
//     log.error(`ShortMessage : ${e.shortMessage}`);
//   }
// });

// At 10 minutes between the hours of 0:00-9:00
// cron.schedule(
//   '*/10 0-9 * * *',
//   async () => {
//     log.success(
//       'Running a job every 10 minutes from 12am to 9am at Europe/Paris timezone'
//     );
//     loader.start();
//     try {
//       await exec('pnpm run prod:update:daily-matches', {
//         shell: true,
//       });

//       log.success('Looks great');
//       loader.stop();
//     } catch (e) {
//       log.error(`Does not look great: ${e.stdout}`);
//       log.error(`ShortMessage : ${e.shortMessage}`);
//     }
//   }
// );

// At 10 minutes past 9:00
// cron.schedule(
//   '10 9 * * *',
//   async () => {
//     log.success('Running a job at 9:10am at Europe/Paris timezone');
//     loader.start();
//     try {
//       await exec('pnpm run prod:update:evals', {
//         shell: true,
//       });

//       log.success('Looks great');
//       loader.stop();
//     } catch (e) {
//       log.error(`Does not look great: ${e.stdout}`);
//       log.error(`ShortMessage : ${e.shortMessage}`);
//     }
//   }
// );

// At 10 minutes past 16:00
// cron.schedule(
//   '30 16 * * *',
//   async () => {
//     log.success('Running a job at 4:30pm at Europe/Paris timezone');
//     loader.start();
//     try {
//       await exec('pnpm run prod:update:daily-matches', {
//         shell: true,
//       });

//       log.success('Looks great');
//       loader.stop();
//     } catch (e) {
//       log.error(`Does not look great: ${e.stdout}`);
//       log.error(`ShortMessage : ${e.shortMessage}`);
//     }
//   }
// );

// At 10 minutes past 10:00 on the 5th day of every month
// cron.schedule('10 12 5 * *', async () => {
//   log.success(
//     'Running a job at 10 minutes past 10am on the 5th day of every month'
//   );
//   log.info('pnpm run prod:update:teams');
//   loader.start();
//   try {
//     await exec('pnpm run prod:update:teams');
//     log.success('Looks great');
//     loader.stop();
//   } catch (e) {
//     log.error(`Does not look great: ${e.stdout}`);
//     log.error(`ShortMessage : ${e.shortMessage}`);
//   }
// });

// Every 10 minutes between the hours of 21:00-00:00 on Sun and Sat
// cron.schedule(
//   '*/10 21-23 * * 0,6',
//   async () => {
//     log.success(
//       'Running a job every 10 minutes on Sat,Sun from 9pm to 12pm at Europe/Paris timezone'
//     );
//     loader.start();
//     try {
//       await exec('pnpm run prod:update:daily-matches', {
//         shell: true,
//       });

//       log.success('Looks great');
//       loader.stop();
//     } catch (e) {
//       log.error(`Does not look great: ${e.stdout}`);
//       log.error(`ShortMessage : ${e.shortMessage}`);
//     }
//   }
// );

// Every 10 minutes between the hours of 8:00-12:00
// cron.schedule(
//   '*/10 8-12 * * *',
//   async () => {
//     log.success(
//       'Running a job every 10min from 8am to 12am at Europe/Paris timezone'
//     );
//     loader.start();
//     try {
//       await exec('pnpm run prod:update:youtube-videos', {
//         shell: true,
//       });

//       log.success('Looks great');
//       loader.stop();
//     } catch (e) {
//       log.error(`Does not look great: ${e.stdout}`);
//       log.error(`ShortMessage : ${e.shortMessage}`);
//     }
//   }
// );
