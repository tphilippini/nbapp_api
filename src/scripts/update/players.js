import mongoose from "mongoose";
import { forEachSeries } from "p-iteration";
import moment from "moment";

import log from "@/helpers/log";
import { db } from "@/config/config";
import Teams from "@/api/teams/team.model";
import Players from "@/api/players/player.model";

import { checkTeamRoster } from "../api/nba";

async function main(connection) {
  return new Promise(async (resolve, reject) => {
    try {
      // PLAYERS
      await grabPlayerNames();
      resolve();
    } catch (error) {
      log.error("Player doesnt save, see error...");
      log.error(error);
      reject(error);
    }
  });
}

async function grabPlayerNames() {
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
  // TEAMS
  log.info("Finding teams...");
  const teams = await Teams.find({ isNBAFranchise: true });
  log.info(`Teams found : ${teams.length}`);

  await forEachSeries(teams, async (team, i) => {
    // await sleep(1000);
    const players = await checkTeamRoster(team.teamShortName);
    await forEachSeries(players, async player => {
      const playerToSave = await Players.findOne({
        playerId: player.person_id
      });

      if (playerToSave) {
        log.info("----------------------------------");
        log.info("Player exists, updating the record now...");
        playerToSave.name = player.first_name + " " + player.last_name;
        playerToSave.firstName = player.first_name;
        playerToSave.lastName = player.last_name;
        playerToSave.number = player.jersey_number;
        playerToSave.position = player.position_short;
        playerToSave.height = player.height_ft + "-" + player.height_in;
        playerToSave.weight = player.weight_lbs;
        playerToSave.birthdate = moment(player.birth_date).format(
          "MMM DD, YYYY"
        );
        playerToSave.age = moment().diff(player.birth_date, "years");
        playerToSave.playerId = player.person_id;
        playerToSave.teamId = team.teamId;
        playerToSave.teamName = team.teamName;
        playerToSave.teamTriCode = team.teamTriCode;

        try {
          let existingPlayer = new Players(playerToSave);
          await existingPlayer.updateOne(playerToSave).then(m => {
            log.success(`Player updated...`);
          });
        } catch (error) {
          log.error("Player doesnt update, see error...");
          log.error(error);
        }
      } else {
        log.info("----------------------------------");
        log.info("Player doesnt exist, creating new record now...");
        const newPlayer = {
          name: player.first_name + " " + player.last_name,
          firstName: player.first_name,
          lastName: player.last_name,
          number: player.jersey_number,
          position: player.position_short,
          height: player.height_ft + "-" + player.height_in,
          weight: player.weight_lbs,
          birthdate: moment(player.birth_date).format("MMM DD, YYYY"),
          age: moment().diff(player.birth_date, "years"),
          playerId: player.person_id,
          teamId: team.teamId,
          teamName: team.teamName,
          teamTriCode: team.teamTriCode
        };

        try {
          let player = new Players(newPlayer);
          await player.save().then(m => {
            log.success("Player saved...");
          });
        } catch (error) {
          log.error("Player doesnt save, see error...");
          log.error(error);
        }
      }
    });
  });

  const count = await Players.estimatedDocumentCount({});
  log.info(`Total players saved : ${count}`);
  log.info("----------------------------------");
}

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

mongoose.connect(
  DATABASE_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
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
