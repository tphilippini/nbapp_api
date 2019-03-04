import moment from 'moment';
import mongoose from 'mongoose';

import log from '../helpers/log';
import { db } from '../config/config';
import MatchSchema from '../schemas/match';
import YoutubeVideoSchema from '../schemas/youtube_video';
import PlayerSchema from '../schemas/player';
import TeamSchema from '../schemas/team';

import { findAndSaveYoutubeVideos } from './models/video';


async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {

    const MatchModel = connection.model('Match', MatchSchema, 'Match');
    const YoutubeVideoModel = mongoose.model('YoutubeVideo', YoutubeVideoSchema, 'YoutubeVideo');
    const PlayerModel = connection.model('Player', PlayerSchema, 'Player');
    const TeamModel = connection.model('Team', TeamSchema, 'Team');

    // YOUTUBE VIDEOS UPDATE
    // MLG Highlights
    log.title(`MLG Highlights`);
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, TeamModel, dateFormatted, 'UCoh_z6QB0AGB1oxWufvbDUg');    
    // House of highlights
    log.title(`House of highlights`);
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, TeamModel, dateFormatted, 'UCqQo7ewe87aYAe7ub5UqXMw');
    log.title(`Ximo Pierto`);
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, TeamModel, dateFormatted, 'UCCxupwq_A5lj-QsNHrUvWhg');
    // Free dawkins
    log.title(`Free dawkins`);
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, TeamModel, dateFormatted, 'UCEjOSbbaOfgnfRODEEMYlCw');
    // Rapid Highlights
    log.title(`Rapid Highlights`);
    await findAndSaveYoutubeVideos(MatchModel, YoutubeVideoModel, PlayerModel, TeamModel, dateFormatted, 'UCdxB6UoY7VggXoaOSvEhSjg');

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
