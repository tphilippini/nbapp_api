'use strict';

var _loader = _interopRequireDefault(require("../../../helpers/loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.useFakeTimers();
describe('loader helper', () => {
  describe('start()', () => {
    test('starts spinner', () => {
      expect(_loader.default.start()).toBeObject();
      jest.runTimersToTime(60000);
      expect(setInterval).toHaveBeenCalledTimes(1);
    });
  });
  describe('stop()', () => {
    test('stops spinner', () => {
      expect(_loader.default.stop()).toBeObject();
    });
  });
});