"use strict";

import UUID from "uuid";
import { isEmail, isUUID } from "validator";
import EventEmitter from "events";
import moment from "moment";

import Users from "@/api/users/user.model";
import Leagues from "@/api/leagues/league.model";

import log from "@/helpers/log";
import response from "@/helpers/response";
import { generatePassword } from "@/helpers/utils";

const leagueController = {};

leagueController.getByUser = (req, res) => {
  log.info("Hi! Getting leagues...");

  const uuid = req.params.uuid;
  const user = req.user;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];
    if (!uuid || !user.email || !user.user) {
      errors.push("missing_params");
    } else {
      if (!isUUID(uuid)) {
        errors.push("invalid_client");
      }

      if (errors.length === 0) {
        Users.findOneByUUID(uuid)
          .then(result => {
            if (result && result.uuid == user.user) {
              Leagues.findLeaguesByObjectId(result._id).then(leagues => {
                if (leagues.length > 0)
                  checkEvent.emit("success", "result_found", leagues);
                else checkEvent.emit("success", "result_empty", []);
              });

              // const league3 = new Leagues({
              //   name: "League 1 Week",
              //   leagueId: UUID.v4(),
              //   ownerId: "5dc2a210d69ae06b9af2bae0",
              //   // ownerId: result._id,
              //   modeNum: 0,
              //   weeks: 1,
              //   photo:
              //     "https://www.billboard.com/files/styles/1500x992_gallery/public/media/kobe-bryant-1999-lakers-billboard-650.jpg",
              //   statusNum: 2
              // });
              // league3.players.push("5dc2a210d69ae06b9af2bae0");
              // league3.players.push(result._id);
              // league3.password = generatePassword();
              // console.log(league3);
              // league3.save().then(ok => {
              //   console.log(ok);
              //   checkEvent.emit("success", "result_empty", []);
              // });
              // Creation de son equipe
              /**
               *  playerId,
               *  leagueId,
               *  name,
               *  shortName: {
                    type: String,
                    required: [true, "can't be blank"],
                    minLength: [3, "Name is too short!"],
                    maxLength: 3,
                    match: [/^[-a-zA-Z0-9]+$/, "is invalid"]
                  },
                  roster: [ objectId, 'players'] //objet contenant les 6 joueurs de son équipe
                  points
                  

               */
            } else {
              errors.push("invalid_credentials");
              checkEvent.emit("error", errors);
            }
          })
          .catch(() => {
            errors.push("invalid_credentials");
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

export default leagueController;
