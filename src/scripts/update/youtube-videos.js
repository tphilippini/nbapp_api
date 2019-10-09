import moment from 'moment';
import mongoose from 'mongoose';
import { forEachSeries } from 'p-iteration';

import log from '@/helpers/log';
import { db, ytChannel } from '@/config/config';
import MatchSchema from '@/schemas/match';
import YoutubeVideoSchema from '@/schemas/youtube_video';
import PlayerSchema from '@/schemas/player';
import TeamSchema from '@/schemas/team';

import { findAndSaveYoutubeVideos } from '../models/video';

async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {
    const MatchModel = connection.model('Match', MatchSchema, 'Match');
    const YoutubeVideoModel = mongoose.model(
      'YoutubeVideo',
      YoutubeVideoSchema,
      'YoutubeVideo'
    );
    const PlayerModel = connection.model('Player', PlayerSchema, 'Player');
    const TeamModel = connection.model('Team', TeamSchema, 'Team');

    // YOUTUBE VIDEOS UPDATE
    await forEachSeries(ytChannel, async (channel, i) => {
      log.title(channel.title);
      await findAndSaveYoutubeVideos(
        MatchModel,
        YoutubeVideoModel,
        PlayerModel,
        TeamModel,
        dateFormatted,
        channel.id
      );
    });

    resolve();
  });
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

    log.title('Initialization');
    log.info(`Connected to the database ${db().name}`);

    log.title('Main');
    // grab todays games and continue to update
    const todayDate = moment()
      .subtract(1, 'd')
      .format('YYYYMMDD');
    main(connection, todayDate).then(() => {
      log.info('----------------------------------');
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
