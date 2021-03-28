import mongoose from 'mongoose';
import axios from 'axios';
import { forEachSeries } from 'p-iteration';

import log from '@/helpers/log';
import { calcEfficiency, calcNotation } from '@/scripts/api/nba';

import Players from '@/api/players/player.model';

require('dotenv').config();

async function main() {
  return new Promise(async (resolve) => {
    log.info('Finding players...');
    // const players = await Players.find({ playerId: 203507 });
    const players = await Players.find();
    log.info(`Todays players found : ${players.length}`);
    if (players.length > 0) {
      await forEachSeries(players, async (player) => {
        try {
          log.info('----------------------------------');
          log.info('Player exists, updating the record now...');

          const uri = `http://data.nba.net/data/10s/prod/v1/2019/players/${player.playerId}_profile.json`;
          // log.success(uri);
          const profile = await axios.get(uri);
          const { latest } = profile.data.league.standard.stats;
          player.efficiency = calcEfficiency(latest);
          player.notation = calcNotation(player.efficiency);

          try {
            const existingPlayer = new Players(player);
            await existingPlayer.updateOne(player).then(() => {
              log.success('Player efficiency updated...');
            });
          } catch (error) {
            log.error('Player doesnt update, see error...');
            log.error(error);
          }
          log.info('----------------------------------');
        } catch (error) {
          log.error(error);
        }
      });

      log.info('----------------------------------');
      log.success('Players evals save/update complete...');
    }

    resolve();
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
  await main(connection).then(() => {
    log.info('----------------------------------');
    log.info('Closed database connection');
    // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
  });

  connection.close();
})();
