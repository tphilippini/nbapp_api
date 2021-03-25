"use strict";

var _execa = _interopRequireDefault(require("execa"));

var _log = _interopRequireDefault(require("../helpers/log"));

var _loader = _interopRequireDefault(require("../helpers/loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * This script ensures the correct coding syntax of the whole project
 */
_asyncToGenerator(function* () {
  _loader.default.start();

  _log.default.info('Linting...');

  try {
    var globs = [//   '"app/**/*.es6.js"',
    //   '"hotword/index.js"',
    //   '"packages/**/*.js"',
    '"./src/**/*.js"', //   '"server/src/**/*.js"',
    //   '"test/*.js"',
    //   '"test/e2e/**/*.js"',
    //   '"test/json/**/*.js"',
    '"./src/tests/unit/**/*.js"'];
    yield (0, _execa.default)("npx eslint ".concat(globs.join(' ')), {
      shell: true
    });

    _log.default.success('Looks great');

    _loader.default.stop();
  } catch (e) {
    console.log(e);

    _log.default.error("Does not look great: ".concat(e.stdout));

    _log.default.error("ShortMessage : ".concat(e.shortMessage));

    _loader.default.stop();

    process.exit(1);
  }
})();