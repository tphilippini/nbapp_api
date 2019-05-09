"use strict";

import TeamSchema from "@/schemas/team";
import mongoose from "mongoose";

class Team {
  constructor() {
    this.model = mongoose.model("Team", TeamSchema, "Team");
  }

  findOneByID(data, cb) {
    this.model
      .findOne({ teamId: data }, (err, result) => {
        if (err) throw err;

        if (result) {
          cb(result);
        } else {
          cb([]);
        }
      }) // hide versionKey and id on response
      .select("-__v")
      .select("-_id");
  }
}

export default new Team();
