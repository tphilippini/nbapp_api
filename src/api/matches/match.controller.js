"use strict";

import EventEmitter from "events";
import moment from "moment";

import Matches from "@/api/matches/match.model";

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
        Matches.findMatchesByStartDate(date)
          .then(matches => {
            if (matches.length > 0)
              checkEvent.emit("success", "result_found", matches);
            else checkEvent.emit("success", "result_empty", []);
          })
          .catch(() => {
            errors.push("invalid_param_value");
            checkEvent.emit("error", errors);
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
