import mongoose from "mongoose";

let MatchSchema = new mongoose.Schema({
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

// MatchSchema.virtual("hTeamRecordFormatted").set(() => {
//   this.hTeamWins + "-" + this.hTeamLosses;
// });

// MatchSchema.virtual("vTeamRecordFormatted").set(() => {
//   this.vTeamWins + "-" + this.vTeamLosses;
// });

// MatchSchema.methods.getMatches = () => {
//   return new Promise((resolve, reject) => {
//     this.find((err, result) => {
//       if (err) {
//         console.error(err);
//         return reject(err);
//       }

//       resolve(result);
//     });
//   });
// };

module.exports = MatchSchema;
