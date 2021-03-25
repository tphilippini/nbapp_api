"use strict";

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _execa = _interopRequireDefault(require("execa"));

var _log = _interopRequireDefault(require("../helpers/log"));

var _loader = _interopRequireDefault(require("../helpers/loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Every minute between the hours of 21:00-00:00 on Sun and Sat
_nodeCron.default.schedule('* 21-23,0 * * 0,6', /*#__PURE__*/_asyncToGenerator(function* () {
  _log.default.info('Running cron...');

  _log.default.default('Every minute on Sat,Sun from 21:00 to 00:00');

  _loader.default.start();

  try {
    yield (0, _execa.default)('npm run update:daily-matches', {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));
  }
})); // Every minute between the hours of 0:00-8:00


_nodeCron.default.schedule('* 0-8 * * *', /*#__PURE__*/_asyncToGenerator(function* () {
  _log.default.info('Running cron...');

  _log.default.default('Every minute between the hours of 0:00-8:00');

  _loader.default.start();

  try {
    yield (0, _execa.default)('npm run update:daily-matches', {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));
  }
})); // At 10 minutes past 16:00


_nodeCron.default.schedule('10 16 * * *', /*#__PURE__*/_asyncToGenerator(function* () {
  _log.default.info('Running cron...');

  _log.default.default('At 10 minutes past 16:00');

  _loader.default.start();

  try {
    yield (0, _execa.default)('npm run update:daily-matches', {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));
  }
})); // At 30 minutes past 8:00


_nodeCron.default.schedule('30 8 * * *', /*#__PURE__*/_asyncToGenerator(function* () {
  _log.default.info('Running cron...');

  _log.default.default('At 30 minutes past 8:00');

  _loader.default.start();

  try {
    yield (0, _execa.default)('npm run update:evals', {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));
  }
})); // At 10 minutes past 10:00 on the 5th day of every month


_nodeCron.default.schedule('10 10 5 * *', /*#__PURE__*/_asyncToGenerator(function* () {
  _log.default.info('Running cron...');

  _log.default.default('At 10 minutes past 10:00 on the 5th day of every month');

  _loader.default.start();

  try {
    yield (0, _execa.default)('npm run update:teams && npm run update:players', {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));
  }
})); // // Every 10 minutes between the hours of 8:00-12:00
// cron.schedule('*/10 8-12 * * *', async () => {
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