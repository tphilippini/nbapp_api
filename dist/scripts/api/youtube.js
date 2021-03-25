"use strict";

var _googleapis = require("googleapis");

var _log = _interopRequireDefault(require("../../helpers/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Check YOUTUBE_API_KEY https://console.developers.google.com/apis/credentials?folder=&organizationId=&project=nba-api-238712
// See limit
// Example video : https://www.youtube.com/watch?v=QZ4BXGgmATU&ab_channel=AnsontheDeveloper
function searchChannel(channelId, q, publishedAfter) {
  return new Promise((resolve, reject) => {
    var service = _googleapis.google.youtube('v3');

    _log.default.info("Searching for video with, channelID: ".concat(channelId));

    _log.default.info("Query: ".concat(q));

    _log.default.info("PublishedAfter: ".concat(publishedAfter));

    service.search.list({
      key: process.env.API_YOUTUBE_TOKEN,
      part: 'snippet',
      channelId,
      order: 'viewCount',
      maxResults: '50',
      publishedAfter,
      q
    }, (err, response) => {
      if (err) {
        _log.default.error("The API returned an error:\n".concat(err));

        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

function videoFromChannel(_x, _x2, _x3) {
  return _videoFromChannel.apply(this, arguments);
}

function _videoFromChannel() {
  _videoFromChannel = _asyncToGenerator(function* (channelId, query, gameStartTime) {
    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (resolve, reject) {
        try {
          var videos = yield searchChannel(channelId, query, gameStartTime);
          resolve(videos.data);
        } catch (error) {
          reject(error);
        }
      });

      return function (_x4, _x5) {
        return _ref.apply(this, arguments);
      };
    }());
  });
  return _videoFromChannel.apply(this, arguments);
}

module.exports = {
  videoFromChannel
};