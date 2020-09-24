import mongoose from 'mongoose';
import { forEachSeries } from 'p-iteration';
import moment from 'moment';

import log from '@/helpers/log';
import Teams from '@/api/teams/team.model';
import Players from '@/api/players/player.model';

import { checkPlayers } from '../api/nba';

require('dotenv').config();

async function grabPlayerNames() {
  // const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
  // Players
  log.info('Finding players...');
  const players = await checkPlayers();
  console.log(`Players found : ${players.length}`);

  await forEachSeries(players, async (player) => {
    if (!player.isActive) return;

    const playerToSave = await Players.findOne({
      playerId: player.personId,
    });
    const team = await Teams.findOneByTeamId(player.teamId);

    if (playerToSave) {
      log.info('----------------------------------');
      log.info('Player exists, updating the record now...');
      playerToSave.name = `${player.firstName} ${player.lastName}`;
      playerToSave.firstName = player.firstName;
      playerToSave.lastName = player.lastName;
      playerToSave.number = player.jersey;
      playerToSave.position = player.pos;
      playerToSave.height = `${player.heightFeet}-${player.heightInches}`;
      playerToSave.heightMeters = player.heightMeters;
      playerToSave.weight = player.weightPounds;
      playerToSave.weightKgs = player.weightKilograms;
      playerToSave.birthdate = moment(player.dateOfBirthUTC).format(
        'MMM DD, YYYY'
      );
      playerToSave.age = moment().diff(player.dateOfBirthUTC, 'years');
      playerToSave.playerId = player.personId;
      playerToSave.teamId = team.teamId;
      playerToSave.teamName = team.teamName;
      playerToSave.teamTriCode = team.teamTriCode;

      try {
        const existingPlayer = new Players(playerToSave);
        await existingPlayer.updateOne(playerToSave).then(() => {
          log.success('Player updated...');
        });
      } catch (error) {
        log.error('Player doesnt update, see error...');
        log.error(error);
      }
    } else {
      log.info('----------------------------------');
      log.info('Player doesnt exist, creating new record now...');
      const newPlayer = {
        name: `${player.firstName} ${player.lastName}`,
        firstName: player.firstName,
        lastName: player.lastName,
        number: player.jersey,
        position: player.pos,
        height: `${player.heightFeet}-${player.heightInches}`,
        heightMeters: player.heightMeters,
        weight: player.weightPounds,
        weightKgs: player.weightKilograms,
        birthdate: moment(player.dateOfBirthUTC).format('MMM DD, YYYY'),
        age: moment().diff(player.dateOfBirthUTC, 'years'),
        playerId: player.personId,
        teamId: team.teamId,
        teamName: team.teamName,
        teamTriCode: team.teamTriCode,
      };

      try {
        const player = new Players(newPlayer);
        await player.save().then(() => {
          log.success('Player saved...');
        });
      } catch (error) {
        log.error('Player doesnt save, see error...');
        log.error(error);
      }
    }
  });

  const count = await Players.estimatedDocumentCount({});
  log.info(`Total players saved : ${count}`);
  log.info('----------------------------------');
}

async function main() {
  return new Promise(async (resolve, reject) => {
    try {
      // PLAYERS
      await grabPlayerNames();
      resolve();
    } catch (error) {
      log.error('Player doesnt save, see error...');
      log.error(error);
      reject(error);
    }
  });
}

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (error, connection) => {
    if (error) {
      log.error(`Connection error to the database ${process.env.DB_NAME}`);
      return;
    }

    log.title('Initialization');
    log.info(`Connected to the database ${process.env.DB_NAME}`);

    log.title('Main');
    main(connection).then(() => {
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
