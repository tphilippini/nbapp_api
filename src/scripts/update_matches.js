import moment from 'moment';
import mongoose from 'mongoose';

import log from '../helpers/log';
import { db } from '../config/config';
import MatchSchema from '../schemas/match';
import MatchStatSchema from '../schemas/match_stat';
import PlayerSchema from '../schemas/player';

import { findTodayMatches } from './api/nba';
import { saveMatchesOrUpdate } from '../models/match';
import matchStatCollector from '../models/match_stat_collector';


async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {

    const MatchModel = connection.model('Match', MatchSchema, 'Match');
    const MatchStatModel = mongoose.model('MatchStat', MatchStatSchema, 'MatchStat');
    const PlayerModel = connection.model('Player', PlayerSchema, 'Player');

    // MATCHES
    log.info('Finding today matches...');
    const todaysMatches = await findTodayMatches(dateFormatted);
    console.log('Todays matches found :', todaysMatches.length);
    if (todaysMatches.length > 0) {
      await saveMatchesOrUpdate(todaysMatches, MatchModel);
      log.info('----------------------------------');
      await matchStatCollector(todaysMatches, MatchModel, MatchStatModel, PlayerModel);
      log.success('Match record save/update complete...');
    }
 
    resolve();
  })
}

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

mongoose.connect(DATABASE_URL,
  { 
    useNewUrlParser: true,
    useCreateIndex: true 
  }, 
  function (error, connection) {
    if (error) return funcCallback(error);

    log.title('Initialization');
    log.info(`Connected to the database ${db().name}`);

    log.title('Main');
    // grab todays games and continue to update
    const todayDate = moment().subtract(1, 'd').format('YYYYMMDD');
    main(connection, todayDate).then(() => {
      log.info('----------------------------------');
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
