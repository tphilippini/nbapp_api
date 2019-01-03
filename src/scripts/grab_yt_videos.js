import moment from 'moment';
import mongoose from 'mongoose';

import log from '../helpers/log';
import { db } from '../config/config';
import MatchSchema from '../schemas/match';
import YoutubeVideoSchema from '../schemas/youtube_video';
import PlayerSchema from '../schemas/player';

import { findAndSaveYoutubeVideos } from '../models/video';


async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {

    const MatchModel = connection.model('Match', MatchSchema, 'Match');
    const YoutubeVideoModel = mongoose.model('YoutubeVideo', YoutubeVideoSchema, 'YoutubeVideo');
    const PlayerModel = connection.model('Player', PlayerSchema, 'Player');

    // YOUTUBE VIDEOS UPDATE
    // MLG Highlights
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, dateFormatted, 'UCoh_z6QB0AGB1oxWufvbDUg');

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
