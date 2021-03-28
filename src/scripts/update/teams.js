import mongoose from 'mongoose';
import { forEachSeries } from 'p-iteration';

import log from '@/helpers/log';
import Teams from '@/api/teams/team.model';

import { findTeams } from '../api/nba';

require('dotenv').config();

async function grabTeams() {
  // TEAMS
  log.info('Finding teams...');
  const teams = await findTeams();
  log.info(`Teams found : ${teams.length}`);

  await forEachSeries(teams, async (team) => {
    if (team.isNBAFranchise) {
      const teamToSave = await Teams.findOne({ teamId: team.teamId });
      if (teamToSave) {
        log.info('----------------------------------');
        log.info(`${team.fullName}`);
        log.info('Team exists, updating the record now...');
        teamToSave.isNBAFranchise = team.isNBAFranchise;
        teamToSave.city = team.city;
        teamToSave.teamId = team.teamId;
        teamToSave.teamName = team.fullName;
        teamToSave.teamShortName = team.urlName;
        teamToSave.teamTriCode = team.tricode;
        teamToSave.confName = team.confName;
        teamToSave.divName = team.divName;

        try {
          const existingTeam = new Teams(teamToSave);
          await existingTeam.updateOne(teamToSave).then(() => {
            log.success('Team updated...');
          });
        } catch (error) {
          log.error('Team doesnt update, see error...');
          log.error(error);
        }
      } else {
        log.info('----------------------------------');
        log.info(`${team.fullName}`);
        log.info('Team doesnt exist, creating new record now...');
        const newTeam = {
          isNBAFranchise: team.isNBAFranchise,
          city: team.city,
          teamId: team.teamId,
          teamName: team.fullName,
          teamShortName: team.urlName,
          teamTriCode: team.tricode,
          confName: team.confName,
          divName: team.divName,
        };

        try {
          const t = new Teams(newTeam);
          await t.save().then(() => {
            log.success('Team saved...');
          });
        } catch (error) {
          log.error('Team doesnt save, see error...');
          log.error(error);
        }
      }
    }
  });

  const count = await Teams.estimatedDocumentCount({});
  log.info('----------------------------------');
  log.info('----------------------------------');
  log.success(`${count} Teams save/update complete...`);
}

async function main() {
  return new Promise(async (resolve, reject) => {
    try {
      // TEAMS
      await grabTeams();
      resolve();
    } catch (error) {
      log.error('Team doesnt save, see error...');
      log.error(error);
      reject();
    }
  });
}

(async () => {
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

  log.title('Initialization');
  const { connection } = mongoose;
  connection.once('open', () => {
    log.success(`Hi! Connecting to the database ${process.env.DB_NAME}`);
  });
  connection.on('error', (err) => {
    log.error(`Connection error to the database ${process.env.DB_NAME}`);
    if (err) {
      log.default(err.message);
    }
    process.exit(1);
  });

  log.title('Main');
  await main().then(() => {
    log.info('----------------------------------');
    log.info('Closed database connection');
    connection.close();
    // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });

  connection.close();
})();
