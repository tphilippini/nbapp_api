import mongoose from "mongoose";

import Teams from "@/api/teams/team.model";
import MatchesStats from "@/api/matches-stats/match-stats.model";
import Players from "@/api/players/player.model";
import YoutubeVideos from "@/api/videos/youtube.model";

let MatchesSchema = new mongoose.Schema(
  {
    id: Number,

    matchId: { type: String, required: true, unique: true },

    isGameActivated: Boolean,

    startDateEastern: String,

    startTimeUTCString: String,

    startTimeUTC: Date,

    endTimeUTC: Date,

    hTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Teams" },

    hTeamId: String,

    hTeamWins: String,

    hTeamLosses: String,

    hTeamTriCode: String,

    hTeamScore: String,

    vTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Teams" },

    vTeamId: String,

    vTeamWins: String,

    vTeamLosses: String,

    vTeamTriCode: String,

    vTeamScore: String,

    statusNum: Number,

    nuggetText: String,

    gameClock: String,

    currentPeriod: Number,

    periodType: Number,

    maxRegular: Number,

    isHalfTime: Boolean,

    isEndOfPeriod: Boolean,

    hTeamQScore: Object,

    vTeamQScore: Object,

    stats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MatchesStats"
      }
    ],

    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "YoutubeVideos"
      }
    ]
  },
  {
    toJSON: { virtuals: true }
  }
);

MatchesSchema.virtual("hTeamRecordFormatted").get(function() {
  return `${this.hTeamWins}-${this.hTeamLosses}`;
});

MatchesSchema.virtual("vTeamRecordFormatted").get(function() {
  return `${this.vTeamWins}-${this.vTeamLosses}`;
});

MatchesSchema.statics.findMatchesByStartDate = function(date) {
  return new Promise((resolve, reject) => {
    this.find({ startDateEastern: date }, (error, matches) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      resolve(matches);
    })
      .select("-__v")
      .select("-_id")
      .populate({
        path: "videos",
        select: "-_id -__v",
        populate: { path: "players", select: "-_id -__v" }
      })
      .populate({
        path: "stats",
        select: "-_id -__v",
        populate: { path: "player", select: "-_id -__v" }
      })
      .populate("hTeam vTeam", "-_id -__v");
    // use leanQueries for extra data manipulation for frontend
    // .lean({ virtuals: true })
  });
};

MatchesSchema.pre("remove", next => {
  this.model("MatchesStats").deleteMany({ match: this._id }, next);
  this.model("YoutubeVideos").deleteMany({ match: this._id }, next);
});

const Matches = mongoose.model("Matches", MatchesSchema, "Matches");
export default Matches;
