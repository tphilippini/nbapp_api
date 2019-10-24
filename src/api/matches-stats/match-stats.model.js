import mongoose from 'mongoose';

const MatchesStatsSchema = new mongoose.Schema({
  id: Number,

  matchIdFull: String,

  playerIdFull: String,

  statsJSON: Object,

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Players'
  },

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matches'
  }
});

const MatchesStats = mongoose.model(
  'MatchesStats',
  MatchesStatsSchema,
  'MatchesStats'
);
export default MatchesStats;
