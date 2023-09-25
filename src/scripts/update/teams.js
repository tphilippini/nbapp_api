import { forEachSeries } from 'p-iteration';
import mongoose from 'mongoose';
import Teams from '@/api/teams/team.model';
import log from '@/helpers/log';
import { findTeams } from '../api/nba';

require('dotenv').config();

async function grabTeams() {
  // TEAMS
  let teams = [];
  try {
    log.info('Finding teams...');
    const listGroups = await findTeams();
    teams = [...listGroups[0].teams, ...listGroups[1].teams];
  } catch (error) {
    log.error('Team doesnt save, see error...');
    log.error(error);
  }

  log.info(`Teams found : ${teams.length}`);
  await forEachSeries(teams, async (item) => {
    const team = item.profile;
    if (team.isLeagueTeam) {
      const teamToSave = await Teams.findOne({ teamId: team.id });
      if (teamToSave) {
        log.info('----------------------------------');
        log.info(`${team.cityEn} ${team.nameEn}`);
        log.info('Team exists, updating the record now...');

        teamToSave.isNBAFranchise = team.isLeagueTeam;
        teamToSave.city = team.city;
        teamToSave.teamId = team.id;
        teamToSave.teamName = team.nameEn;
        teamToSave.teamShortName = team.code;
        teamToSave.teamTriCode = team.abbr;
        teamToSave.confName = team.conference;
        teamToSave.divName = team.division;

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
        log.info(`${team.cityEn} ${team.nameEn}`);
        log.info('Team doesnt exist, creating new record now...');

        const newTeam = {
          isNBAFranchise: team.isLeagueTeam,
          city: team.city,
          teamId: team.id,
          teamName: team.nameEn,
          teamShortName: team.code,
          teamTriCode: team.abbr,
          confName: team.conference,
          divName: team.division,
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
  connection.once('close', () => {
    log.success(`Hi! Disconnecting to the database ${process.env.DB_NAME}`);
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
})();
