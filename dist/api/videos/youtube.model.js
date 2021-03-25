"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var YoutubeVideosSchema = new _mongoose.default.Schema({
  id: Number,
  match: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Matches'
  },
  players: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Players'
  }],
  channelTitle: String,
  channelId: String,
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  matchId: String,
  publishedAt: Date,
  publishedAtString: String,
  description: String,
  title: String,
  thumbnailUrlLarge: String,
  thumbnailUrlMedium: String,
  thumbnailUrlSmall: String,
  videoType: String
}); // eslint-disable-next-line func-names

YoutubeVideosSchema.statics.findYoutubeVideoByMatchID = function (id) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    this.find({
      matchId: id
    }, (error, docs) => {
      if (error) {
        return reject(error);
      }

      resolve(docs);
    }).select('-__v').select('-_id'); // use leanQueries for extra data manipulation for frontend
    // .lean();
  });
};

var YoutubeVideos = _mongoose.default.model('YoutubeVideos', YoutubeVideosSchema, 'YoutubeVideos');

var _default = YoutubeVideos;
exports.default = _default;