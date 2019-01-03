import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const MatchStatSchema = new Schema({
  
  id: Number,

  matchIdFull: String,

  playerIdFull: String,

  statsJSON: Object
});

module.exports = MatchStatSchema;
