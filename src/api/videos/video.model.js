"use strict";

import YoutubeSchema from "@/schemas/youtube_video";
import mongoose from "mongoose";

class Video {
  constructor() {
    this.youtubeModel = mongoose.model(
      "YoutubeVideo",
      YoutubeSchema,
      "YoutubeVideo"
    );
  }

  findOneYoutubeVideoByMatchID(data, cb) {
    this.youtubeModel
      .find({ matchId: data }, (err, result) => {
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

export default new Video();
