'use strict';

var _os = _interopRequireDefault(require("../../../helpers/os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('OS helper', () => {
  describe('get()', () => {
    test('returns information about the OS', () => {
      var info = _os.default.get();

      expect(info.type).toBeOneOf(['windows', 'linux', 'macos']);
      expect(info.name).toBeOneOf(['Windows', 'Linux', 'macOS']);
    });
    test('returns information for Windows', () => {
      jest.unmock('os');

      var o = require.requireActual('os');

      o.type = jest.fn(() => 'Windows_NT');
      expect(_os.default.get()).toEqual({
        name: 'Windows',
        type: 'windows'
      });
    });
    test('returns information for Linux', () => {
      jest.unmock('os');

      var o = require.requireActual('os');

      o.type = jest.fn(() => 'Linux');
      expect(_os.default.get()).toEqual({
        name: 'Linux',
        type: 'linux'
      });
    });
    test('returns information for macOS', () => {
      jest.unmock('os');

      var o = require.requireActual('os');

      o.type = jest.fn(() => 'Darwin');
      expect(_os.default.get()).toEqual({
        name: 'macOS',
        type: 'macos'
      });
    });
  });
  describe('cpus()', () => {
    test('returns the number of cores on the machine', () => {
      expect(_os.default.cpus()).toBeArray();
      expect(_os.default.cpus()[0]).toContainKeys(['model', 'speed', 'times']);
    });
  });
});