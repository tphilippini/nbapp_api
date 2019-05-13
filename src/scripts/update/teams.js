import mongoose from "mongoose";
import { forEachSeries } from "p-iteration";

import log from "@/helpers/log";
import { db } from "@/config/config";
import TeamSchema from "@/schemas/team";
import { findTeams } from "../api/nba";

async function main(connection) {
  return new Promise(async (resolve, reject) => {
    const teamModel = connection.model("Team", TeamSchema, "Team");

    // TEAMS
    await grabTeams(teamModel);

    resolve();
  });
}

async function grabTeams(teamModel) {
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

  // TEAMS
  log.info("Finding teams...");
  const teams = await findTeams();
  log.default("Teams found :", teams.length);

  await forEachSeries(teams, async (team, i) => {
    if (team.isNBAFranchise) {
      await sleep(1000);

      const teamToSave = await teamModel.findOne({ teamId: team.teamId });
      if (teamToSave) {
        log.info("----------------------------------");
        log.info("Team exists, updating the record now...");
        teamToSave.isNBAFranchise = team.isNBAFranchise;
        teamToSave.city = team.city;
        teamToSave.teamId = team.teamId;
        teamToSave.teamName = team.fullName;
        teamToSave.teamShortName = team.nickname;
        teamToSave.teamTriCode = team.tricode;
        teamToSave.confName = team.confName;
        teamToSave.divName = team.divName;

        try {
          let existingTeam = new teamModel(teamToSave);
          await existingTeam.updateOne(teamToSave).then(m => {
            log.success(`Team updated...`);
          });
        } catch (error) {
          log.error("Team doesnt update, see error...");
          log.error(error);
        }
      } else {
        log.info("----------------------------------");
        log.info("Team doesnt exist, creating new record now...");
        const newTeam = {
          isNBAFranchise: team.isNBAFranchise,
          city: team.city,
          teamId: team.teamId,
          teamName: team.fullName,
          teamShortName: team.nickname,
          teamTriCode: team.tricode,
          confName: team.confName,
          divName: team.divName
        };

        try {
          let t = new teamModel(newTeam);
          await t.save().then(m => {
            log.success("Team saved...");
          });
        } catch (error) {
          log.error("Team doesnt save, see error...");
          log.error(error);
        }
      }
    }
  });

  const count = await teamModel.estimatedDocumentCount({});
  log.info(`Total teams saved : ${count}`);
  log.info("----------------------------------");
}

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

mongoose.connect(
  DATABASE_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  },
  function(error, connection) {
    if (error) return funcCallback(error);

    log.title("Initialization");
    log.info(`Connected to the database ${db().name}`);

    log.title("Main");
    main(connection).then(() => {
      log.info("Closed database connection");
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
