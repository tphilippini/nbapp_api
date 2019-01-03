import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const YoutubeVideoSchema = new Schema({

  id: Number,

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
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


module.exports = YoutubeVideoSchema;