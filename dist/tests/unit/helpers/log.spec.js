'use strict';

var _log = _interopRequireDefault(require("../../../helpers/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('log helper', () => {
  describe('success()', () => {
    test('logs success', () => {
      console.log = jest.fn();

      _log.default.success('This is a success');

      expect(console.log.mock.calls[0][1]).toBe('This is a success');
    });
  });
  describe('info()', () => {
    test('logs info', () => {
      console.info = jest.fn();

      _log.default.info('This is an info');

      expect(console.info.mock.calls[0][1]).toBe('This is an info');
    });
  });
  describe('error()', () => {
    test('logs error', () => {
      console.error = jest.fn();

      _log.default.error('This is an error');

      expect(console.error.mock.calls[0][1]).toBe('This is an error');
    });
  });
  describe('warning()', () => {
    test('logs warning', () => {
      console.warn = jest.fn();

      _log.default.warning('This is a warning');

      expect(console.warn.mock.calls[0][1]).toBe('This is a warning');
    });
  });
  describe('title()', () => {
    test('logs title', () => {
      console.log = jest.fn();

      _log.default.title('This is a title');

      expect(console.log.mock.calls[0][1]).toBe('THIS IS A TITLE');
    });
  });
  describe('default()', () => {
    test('logs default', () => {
      console.log = jest.fn();

      _log.default.default('This is a default');

      expect(console.log.mock.calls[0][1]).toBe('This is a default');
    });
  });
});