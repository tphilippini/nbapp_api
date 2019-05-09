"use strict";

import EventEmitter from "events";
import moment from "moment";

import Match from "@/api/matches/match.model";
import Team from "@/api/teams/team.model";
import Video from "@/api/videos/video.model";

import log from "@/helpers/log";
import response from "@/helpers/response";

const matchController = {};

matchController.matchByDate = (req, res) => {
  log.info("Hi! Getting matches...");

  const date = req.params.startDate;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!date) {
      errors.push("missing_params");
    } else {
      if (!moment(date, "yyyymmdd").isValid()) {
        errors.push("invalid_param_value");
      }

      if (errors.length === 0) {
        Match.find({ startDateEastern: date }, matches => {
          var len = matches.length;
          let curIdx = 0;
          let newMatches = [];

          if (len > 0) {
            matches.forEach(match => {
              match.hTeamRecordFormatted =
                match.hTeamWins + "-" + match.hTeamLosses;
              match.vTeamRecordFormatted =
                match.vTeamWins + "-" + match.vTeamLosses;

              Team.findOneByID(match.hTeamId, hres => {
                match.hTeam = hres;

                Team.findOneByID(match.vTeamId, vres => {
                  match.vTeam = vres;

                  Video.findOneYoutubeVideoByMatchID(match.matchId, videos => {
                    match.youtubeVideos = videos;

                    newMatches.push(match);
                    ++curIdx;

                    if (curIdx == len) {
                      checkEvent.emit("success", "result_found", newMatches);
                    }
                  });
                });
              });
            });
          } else {
            checkEvent.emit("success", "result_empty", newMatches);
          }
        });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit("error", errors);
    }
  };

  checkEvent.on("error", err => {
    response.error(res, 400, err);
  });

  checkEvent.on("success", (code, result) => {
    response.success(res, 200, code, ...result);
  });

  checking();
};

export default matchController;
