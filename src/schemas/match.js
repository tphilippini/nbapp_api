import mongoose from 'mongoose'

const MatchSchema = new mongoose.Schema({
  
  id: Number,
  
  matchId: { type: String, required: true, unique: true },

  isGameActivated: Boolean,

  startDateEastern: String,

  startTimeUTCString: String,

  startTimeUTC: Date,

  endTimeUTC: Date,

  hTeamId: String,

  hTeamWins: String,

  hTeamLosses: String,

  hTeamTriCode: String,

  hTeamScore: String,

  vTeamId: String,

  vTeamWins: String,

  vTeamLosses: String,

  vTeamTriCode: String,

  vTeamScore: String,

  statusNum: Number,

  gameClock: String,

  currentPeriod: Number,

  periodType: Number,

  maxRegular: Number,

  isHalfTime: Boolean,

  isEndOfPeriod: Boolean,

  hTeamQScore: Object,

  vTeamQScore: Object
});

module.exports = MatchSchema;