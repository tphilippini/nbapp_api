import mongoose from "mongoose";

let LeaguesSchema = new mongoose.Schema(
  {
    id: Number,

    leagueId: { type: String, required: true, unique: true, index: true },

    name: {
      type: String,
      required: [true, "can't be blank"],
      minLength: [4, "Name is too short!"],
      maxLength: 20,
      match: [/^[-a-zA-Z0-9\s]+$/, "is invalid"]
    },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
      }
    ],

    photo: String,

    password: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      maxLength: 10,
      match: [/^[-a-zA-Z0-9]+$/, "is invalid"]
    },

    // 0 All rest of the season, 1 semaine, 2 semaines, ... à partir du 1er dimanche de la created_at
    // Si creation Mardi 24 Février, debut championnat, Dimanche 1er mars 18h
    weeks: {
      type: Number,
      min: 0,
      max: 4,
      default: 1
    },

    // 0 Terminé, 1 en cours, 2 active
    statusNum: {
      type: Number,
      min: 0,
      max: 2,
      default: 1
    },

    // 0 Free, 1 ..., 2 ...
    modeNum: {
      type: Number,
      min: 0,
      max: 2,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

LeaguesSchema.statics.findLeaguesByObjectId = function(objId) {
  return new Promise((resolve, reject) => {
    this.find(
      { players: { $elemMatch: { $eq: mongoose.Types.ObjectId(objId) } } },
      (error, leagues) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        resolve(leagues);
      }
    )
      .select("-__v")
      .select("-_id")
      .populate("players", { _id: 0, uuid: 1, alias: 1 });
    // use leanQueries for extra data manipulation for frontend
    // .lean({ virtuals: true })
  });
};

LeaguesSchema.pre("remove", next => {
  this.model("LeaguesTeams").deleteMany({ leagueId: this._id }, next);
});

const Leagues = mongoose.model("Leagues", LeaguesSchema, "Leagues");
export default Leagues;
