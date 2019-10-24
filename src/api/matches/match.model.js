import mongoose from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

let MatchesSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true }
  }
);

MatchesSchema.virtual('hTeamRecordFormatted').get(function() {
  return `${this.hTeamWins}-${this.hTeamLosses}`;
});

MatchesSchema.virtual('vTeamRecordFormatted').get(function() {
  return `${this.vTeamWins}-${this.vTeamLosses}`;
});

MatchesSchema.statics.findMatchesByStartDate = function(date) {
  return new Promise((resolve, reject) => {
    this.find({ startDateEastern: date }, (error, docs) => {
      if (error) {
        return reject(error);
      }
      resolve(docs);
    })
      .select('-__v')
      .select('-_id')
      // use leanQueries for extra data manipulation for frontend
      .lean({ virtuals: true });
  });
};

MatchesSchema.pre('remove', next => {
  this.model('MatchesStats').deleteMany({ match: this._id }, next);
  this.model('YoutubeVideos').deleteMany({ match: this._id }, next);
});

MatchesSchema.plugin(mongooseLeanVirtuals);

const Matches = mongoose.model('Matches', MatchesSchema, 'Matches');
export default Matches;
