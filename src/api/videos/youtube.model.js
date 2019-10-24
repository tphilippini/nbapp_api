import mongoose from 'mongoose';

const YoutubeVideosSchema = new mongoose.Schema({
  id: Number,

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matches'
  },

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Players'
  },

  channelTitle: String,

  channelId: String,

  videoId: { type: String, required: true, unique: true },

  matchId: String,

  publishedAt: Date,

  publishedAtString: String,

  description: String,

  title: String,

  thumbnailUrlLarge: String,

  thumbnailUrlMedium: String,

  thumbnailUrlSmall: String,

  videoType: String
});

YoutubeVideosSchema.statics.findYoutubeVideoByMatchID = function(id) {
  return new Promise((resolve, reject) => {
    this.find({ matchId: id }, (error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    })
      .select('-__v')
      .select('-_id');
    // use leanQueries for extra data manipulation for frontend
    // .lean();
  });
};

const YoutubeVideos = mongoose.model(
  'YoutubeVideos',
  YoutubeVideosSchema,
  'YoutubeVideos'
);
export default YoutubeVideos;
