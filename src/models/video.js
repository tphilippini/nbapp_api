import log from '../helpers/log';
// import { forEachSeries } from 'p-iteration';

async function findAndSaveYoutubeVideos(matchModel, youtubeVideoModel, playerModel, dateFormatted, channelId) {
  return new Promise(async (resolve, reject) => {
    try {
      
      log.info('----------------------------------');
      console.log('update yt video');
      
      /*
      // console.log('find and save youtube videos called');
      // find all matches in match collection with start date of today
      const todaysMatches = await matchRepository.find({ where: { startDateEastern: dateFormatted } });
      // console.log(`found ${todaysMatches.length} matches.`);
      await forEachSeries(todaysMatches, async (match) => {
        if (match.statusNum === 3 && matchNotFresh(match.endTimeUTC)) {
          // console.log('match is finished and 10+ hours since ended, dont search for videos');
        } else if (match.statusNum === 3 && !matchNotFresh(match.endTimeUTC)) {
          // console.log('ready to look for videos, match is over but < 8 hours since it ended');
          // console.log(TRI_CODE_TO_TEAM_NAME[match.hTeamTriCode], TRI_CODE_TO_TEAM_NAME[match.vTeamTriCode]);
          const videos = await videoFromChannel(channelId, `${TRI_CODE_TO_TEAM_NAME[match.hTeamTriCode]} | ${TRI_CODE_TO_TEAM_NAME[match.vTeamTriCode]}`, moment(match.startTimeUTCString).toISOString());

          if (videos.items.length > 0) {
            await saveVideosToDB(matchRepository, youtubeVideoRepository, playerRepository, videos.items, match.id);
            // console.log(`finished saving videos for match: ${match.id}`)
          }
        } else if (match.statusNum === 2) {
          // console.log('ready to look for videos, match is active');
          // console.log(TRI_CODE_TO_TEAM_NAME[match.hTeamTriCode], TRI_CODE_TO_TEAM_NAME[match.vTeamTriCode]);
          const videos = await videoFromChannel(channelId, `${TRI_CODE_TO_TEAM_NAME[match.hTeamTriCode]} | ${TRI_CODE_TO_TEAM_NAME[match.vTeamTriCode]}`, moment(match.startTimeUTCString).toISOString());

          if (videos.items.length > 0) {
            await saveVideosToDB(matchRepository, youtubeVideoRepository, playerRepository, videos.items, match.id);
            // console.log(`finished saving videos for match: ${match.id}`)
          }
        } else {
          // console.log('match is not yet active, dont look for youtube videos');
        }
      })
      console.log('finished going through each match for youtube videos');
      */

      resolve('done fetching videos');
    } catch (error) {
      reject(error);
    }
  });
}

export {
  findAndSaveYoutubeVideos
};