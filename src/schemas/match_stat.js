import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const MatchStatSchema = new Schema({
  
  id: Number,

  matchIdFull: String,

  playerIdFull: String,

  statsJSON: Object,

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }
});

module.exports = MatchStatSchema;
