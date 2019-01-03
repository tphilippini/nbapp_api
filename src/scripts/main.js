import moment from 'moment';
import log from '../helpers/log';
import { db } from '../config/config';

import MatchSchema from '../schemas/match';
import MatchStatSchema from '../schemas/match_stat';
import PlayerSchema from '../schemas/player';

import { findTodayMatches } from './api/nba';
import { saveMatchesOrUpdate } from '../models/match';
import matchStatCollector from '../models/match_stat_collector';
import mongoose from 'mongoose';


async function main(connection, dateFormatted, dateFormattedYesterday, date) {
  return new Promise(async (resolve, reject) => {

    const MatchModel = connection.model('Match', MatchSchema, 'Match');
    // const MatchStatModel = mongoose.model('MatchStat', MatchStatSchema, 'MatchStat');
    const PlayerModel = connection.model('Player', PlayerSchema, 'Player');

    // MATCHES
    log.info('Finding today matches...');
    const todaysMatches = await findTodayMatches(dateFormatted);
    console.log('Todays matches found :', todaysMatches.length);
    if (todaysMatches.length > 0) {
      await saveMatchesOrUpdate(todaysMatches, MatchModel);
      // await matchStatCollector(todaysMatches, MatchModel, MatchStatModel, PlayerModel);
    //   console.log('match record save/update complete');

    //   const { notStarted, active, over, overRecent } = await checkGameStatus(todaysMatches);
    //   console.log(notStarted.length, active.length, over.length, overRecent.length);

    //   const gameThreadsToCreate = await findGameThreads(overRecent, matchRepository, date);
    //   if (gameThreadsToCreate.length > 0) {
    //     await saveGameThreads(gameThreadsToCreate, matchRepository, threadRepository)
    //     console.log('game thread save/update complete');
    //   }
    }
    // await findPostGameThreads(matchRepository, postGameThreadRepository);
    // //STREAMABLES
    // const streamables = await findStreamablePosts(date, r);
    // const formattedStreamables = await formatStreamablePosts(streamables);
    // await saveAndUpdateStreamables(formattedStreamables, streamableRepository, matchRepository);
    resolve();
  })
}

const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

mongoose.connect(DATABASE_URL,
  { useNewUrlParser: true,
    useCreateIndex: true 
  }, 
  function (error, connection) {
    if (error) return funcCallback(error);

    log.title('Initialization');
    log.info(`Connected to the database ${db().name}`);

    log.title('Main');
    // grab todays games and continue to update
    const todayDate = moment().subtract(1, 'd').format('YYYYMMDD');
    const yesterdayDate = moment().subtract(2, 'd').format('YYYYMMDD');
    const date = moment().startOf('day').subtract(1, 'd');

    main(connection, todayDate, yesterdayDate, date).then(() => {
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
