import mongoose from 'mongoose'

const MatchStatSchema = new mongoose.Schema({
  
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
