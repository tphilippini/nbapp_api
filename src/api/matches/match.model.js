"use strict";

import MatchSchema from "@/schemas/match";
import mongoose from "mongoose";

class Match {
  constructor() {
    this.model = mongoose.model("Match", MatchSchema, "Match");
  }

  find(data, cb) {
    this.model
      .find(data, (err, result) => {
        if (err) throw err;

        cb(result);
      })
      // hide versionKey and id on response
      .select("-__v")
      .select("-_id")
      // use leanQueries for extra data manipulation for frontend
      .lean();
  }
}

export default new Match();
