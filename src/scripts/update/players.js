import mongoose from "mongoose";
import axios from "axios";
import { forEachSeries } from "p-iteration";

import log from "@/helpers/log";
import { db } from "@/config/config";
import PlayerSchema from "@/schemas/player";
import TeamSchema from "@/schemas/team";

async function main(connection) {
  return new Promise(async (resolve, reject) => {
    const PlayerModel = connection.model("Player", PlayerSchema, "Player");
    const TeamModel = connection.model("Team", TeamSchema, "Team");

    // PLAYERS
    await grabPlayerNames(PlayerModel, TeamModel);

    resolve();
  });
}

async function grabPlayerNames(playerModel, teamModel) {
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

  // TEAMS
  log.info("Finding teams...");
  const teams = await teamModel.find({ isNBAFranchise: true });
  log.default("Teams found :", teams.length);

  await forEachSeries(teams, async (team, i) => {
    await sleep(1000);
    const FETCH_URL = `http://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2018-19&TeamID=${
      team.teamId
    }`;
    log.success(FETCH_URL);
    const players = await axios
      .get(FETCH_URL)
      .then(res => res.data.resultSets[0].rowSet);

    await forEachSeries(players, async player => {
      const playerToSave = await playerModel.findOne({ playerId: player[12] });
      if (playerToSave) {
        log.info("----------------------------------");
        log.info("Player exists, updating the record now...");
        playerToSave.name = player[3];
        playerToSave.firstName = player[3].split(" ")[0];
        playerToSave.lastName = player[3].split(" ")[1]
          ? player[3].split(" ")[1]
          : "";
        playerToSave.number = player[4];
        playerToSave.position = player[5];
        playerToSave.height = player[6];
        playerToSave.weight = player[7];
        playerToSave.birthdate = player[8];
        playerToSave.age = player[9];
        playerToSave.playerId = player[12];
        playerToSave.teamId = team.teamId;
        playerToSave.teamName = team.teamName;
        playerToSave.teamTriCode = team.teamTriCode;

        try {
          let existingPlayer = new playerModel(playerToSave);
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
          name: player[3],
          firstName: player[3].split(" ")[0],
          lastName: player[3].split(" ")[1] ? player[3].split(" ")[1] : "",
          number: player[4],
          position: player[5],
          height: player[6],
          weight: player[7],
          birthdate: player[8],
          age: player[9],
          playerId: player[12],
          teamId: team.teamId,
          teamName: team.teamName,
          teamTriCode: team.teamTriCode
        };

        try {
          let player = new playerModel(newPlayer);
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

  const count = await playerModel.estimatedDocumentCount({});
  log.info(`Total players saved : ${count}`);
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
