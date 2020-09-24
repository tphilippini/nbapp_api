import execa from 'execa';

import log from '../tests/unit/helpers/node_modules/@/helpers/log';
import loader from '@/helpers/loader';

/**
 * This script ensures the correct coding syntax of the whole project
 */
(async () => {
  loader.start();
  log.info('Linting...');

  try {
    const globs = [
      //   '"app/**/*.es6.js"',
      //   '"packages/**/*.js"',
      '"./src/**/*.js"',
      //   '"server/src/**/*.js"',
      //   '"test/*.js"',
      //   '"test/e2e/**/*.js"',
      //   '"test/json/**/*.js"',
      '"./src/tests/unit/**/*.js"',
    ];

    await execa(`npx eslint ${globs.join(' ')}`, {
      shell: true,
    });

    log.success('Looks great');
    loader.stop();
  } catch (e) {
    console.log(e);
    log.error(`Does not look great: ${e.stdout}`);
    log.error(`ShortMessage : ${e.shortMessage}`);
    loader.stop();
    process.exit(1);
  }
})();
