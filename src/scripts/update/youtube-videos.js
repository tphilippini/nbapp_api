/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { forEachSeries } from 'p-iteration';

import log from '@/helpers/log';
import { ytChannel } from '@/config/config';
// eslint-disable-next-line import/named
import { videoFromChannel } from '@/scripts/api/youtube';

import Matches from '@/api/matches/match.model';
import Teams from '@/api/teams/team.model';
import Players from '@/api/players/player.model';
import YoutubeVideos from '@/api/videos/youtube.model';

require('dotenv').config();

const limitHours = 18;

function matchNotFresh(endTimeUTC) {
  const hours = dayjs().diff(dayjs(endTimeUTC), 'hours');
  log.default(`Time since match ended: ${hours}`);
  return hours > limitHours;
}

async function determineVideoTypeFromTitle(title) {
  let type;
  let playerId;
  let duelIds;
  const name = `${title.split(' ')[0]} ${title.split(' ')[1]}`;
  log.default(`Determine video type for ${name}`);

  const titleLowerCase = title.toLowerCase();
  if (titleLowerCase.includes('interview')) {
    const player = await Players.find({ name });

    if (player.length === 1) {
      type = `interview ${name}`;
      playerId = player[0].playerId;
    } else {
      type = 'interview unidentified';
    }

    if (titleLowerCase.includes('postgame')) {
      type += ' postgame';
    } else if (titleLowerCase.includes('pregame')) {
      type += ' pregame';
    }
  } else if (titleLowerCase.includes('highlights')) {
    type = 'highlights';
    if (titleLowerCase.includes('pts') || titleLowerCase.includes('points')) {
      // if it's a player highlight, try to figure out which player it is.
      const player = await Players.find({ name });

      if (player.length === 1) {
        type = `player highlights ${name}`;
        playerId = player[0].playerId;
      } else {
        type = 'player highlights unidentified';
      }
    } else if (
      titleLowerCase.includes('full game') ||
      title.includes('full highlights')
    ) {
      type = 'full game highlights';
    } else if (titleLowerCase.includes('1st qtr')) {
      type = 'first quarter highlights';
    } else if (titleLowerCase.includes('1st half')) {
      type = 'first half highlights';
    } else if (
      titleLowerCase.includes('duel') ||
      titleLowerCase.includes('battle')
    ) {
      type = 'duel highlights';

      // determine id of both players in the duel
      // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
      const player1Name = title.split('vs')[0].slice(0, -1);
      let player2Name = '';
      if (title.split('vs')[1]) {
        player2Name = `${title.split('vs')[1].split(' ')[1]} ${
          title.split('vs')[1].split(' ')[2]
        }`;
      }

      const player1 = await Players.find({ name: player1Name });
      const player2 = await Players.find({ name: player2Name });

      // if both players can be identified,
      // send back duelIds for each so they are saved in ManyToMany relationship.
      if (player1.length === 1 && player2.length === 1) {
        duelIds = [player1[0].playerId, player2[0].playerId];
      } else if (player1.length === 1) {
        playerId = player1[0].playerId;
      } else if (player2.length === 1) {
        playerId = player2[0].playerId;
      }
    }
  } else if (
    titleLowerCase.includes('duel') ||
    titleLowerCase.includes('battle')
  ) {
    type = 'duel highlights';

    // determine id of both players in the duel
    // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
    const player1Name = title.split('vs')[0].slice(0, -1);
    let player2Name = '';
    if (title.split('vs')[1]) {
      player2Name = `${title.split('vs')[1].split(' ')[1]} ${
        title.split('vs')[1].split(' ')[2]
      }`;
    }

    const player1 = await Players.find({ name: player1Name });
    const player2 = await Players.find({ name: player2Name });

    // if both players can be identified,
    // send back duelIds for each so they are saved in ManyToMany relationship.
    if (player1.length === 1 && player2.length === 1) {
      duelIds = [player1[0].playerId, player2[0].playerId];
    } else if (player1.length === 1) {
      playerId = player1[0].playerId;
    } else if (player2.length === 1) {
      playerId = player2[0].playerId;
    }
  } else if (titleLowerCase.includes('&')) {
    type = 'team highlights';

    // determine id of both players in the duel
    // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
    const player1Name = title.split('&')[0].slice(0, -1);
    const player2Name = `${title.split('&')[1].split(' ')[1]} ${
      title.split('&')[1].split(' ')[2]
    }`;

    const player1 = await Players.find({ name: player1Name });
    const player2 = await Players.find({ name: player2Name });

    // if both players can be identified,
    // send back duelIds for each so they are saved in ManyToMany relationship.
    if (player1.length === 1 && player2.length === 1) {
      duelIds = [player1[0].playerId, player2[0].playerId];
    } else if (player1.length === 1) {
      playerId = player1[0].playerId;
    } else if (player2.length === 1) {
      playerId = player2[0].playerId;
    }
  } else {
    type = 'highlights';
  }
  return { type, playerId, duelIds };
}

async function saveVideosToDB(videos, matchRecordId) {
  return new Promise(async (resolve) => {
    await forEachSeries(videos, async (video) => {
      const exists = await YoutubeVideos.find({ videoId: video.id.videoId });
      if (exists.length === 1) {
        log.info(`Video ${video.id.videoId} exists already, skip`);
      } else {
        log.info(`${video.snippet.title}`);
        log.info("Video doesn't exist, attempting to save video");
        const { type, playerId, duelIds } = await determineVideoTypeFromTitle(
          video.snippet.title
        );

        const videoToSave = new YoutubeVideos();

        if (playerId) {
          const player1 = await Players.findOne({ playerId });
          videoToSave.players.push(player1._id);
        } else if (duelIds) {
          const player1 = await Players.findOne({ playerId: duelIds[0] });
          const player2 = await Players.findOne({ playerId: duelIds[1] });
          videoToSave.players.push(player1._id);
          videoToSave.players.push(player2._id);
        }

        videoToSave.channelTitle = video.snippet.channelTitle;
        videoToSave.channelId = video.snippet.channelId;
        videoToSave.title = video.snippet.title;
        videoToSave.description = video.snippet.description;
        videoToSave.videoId = video.id.videoId;
        videoToSave.videoType = type;
        videoToSave.matchId = matchRecordId;
        videoToSave.publishedAt = new Date(video.snippet.publishedAt);
        videoToSave.publishedAtString = video.snippet.publishedAt;
        videoToSave.thumbnailUrlLarge = video.snippet.thumbnails.high.url;
        videoToSave.thumbnailUrlMedium = video.snippet.thumbnails.medium.url;
        videoToSave.thumbnailUrlSmall = video.snippet.thumbnails.default.url;

        const existingMatch = await Matches.findOne({
          matchId: matchRecordId,
        });
        videoToSave.match = existingMatch;

        try {
          await videoToSave.save().then((m) => {
            log.success(`Youtube video saved for match ${matchRecordId}`);
            // Update videos list in match
            existingMatch.videos.push(m._id);
          });

          await existingMatch
            .save()
            .then(() => {
              log.success('Match record update complete...');
              log.info('----------------------------------');
            })
            .catch((error) => {
              log.info('Match doesnt exist, didnt start probably...');
              log.error(error);
              log.info('----------------------------------');
            });
        } catch (error) {
          log.error('Youtube video doesnt save, see error...');
          log.error(error);
        }
      }
    });
    resolve();
  });
}

async function findAndSaveYoutubeVideos(dateFormatted, channelId) {
  return new Promise(async (resolve, reject) => {
    try {
      log.info('----------------------------------');
      const todaysMatches = await Matches.find({
        startDateEastern: dateFormatted,
      });
      log.success(`Found ${todaysMatches.length} matches.`);
      const teams = await Teams.find();

      await forEachSeries(todaysMatches, async (match) => {
        const hTeam = teams.find((t) => t.teamTriCode === match.hTeamTriCode);
        const vTeam = teams.find((t) => t.teamTriCode === match.vTeamTriCode);

        if (hTeam && vTeam) {
          if (match.statusNum === 3 && matchNotFresh(match.endTimeUTC)) {
            log.warning(
              `Match is finished and ${limitHours}+ hours since ended, dont search for videos`
            );
          } else if (
            match.statusNum === 3 &&
            !matchNotFresh(match.endTimeUTC)
          ) {
            log.default(`${hTeam.teamName} vs ${vTeam.teamName}`);
            log.default(
              `Ready to look for videos, match is over but < ${limitHours} hours since it ended`
            );

            const videos = await videoFromChannel(
              channelId,
              `"${hTeam.teamName}"|"${hTeam.teamShortName}"|"${vTeam.teamName}"|"${vTeam.teamShortName}"`,
              dayjs(match.startTimeUTCString).toISOString()
            );
            log.success(`Found ${videos.items.length} videos.`);

            if (videos.items.length > 0) {
              await saveVideosToDB(videos.items, match.matchId);
              log.success(`Finished saving videos for match: ${match.matchId}`);
              log.info('----------------------------------');
            }
          } else if (match.statusNum === 2) {
            log.default(hTeam.teamName, vTeam.teamName);
            log.default('Ready to look for videos, match is active');

            const videos = await videoFromChannel(
              channelId,
              `"${hTeam.teamName}"|"${hTeam.teamShortName}"|"${vTeam.teamName}"|"${vTeam.teamShortName}"`,
              dayjs(match.startTimeUTCString).toISOString()
            );
            log.success(`Found ${videos.items.length} videos.`);

            if (videos.items.length > 0) {
              await saveVideosToDB(videos.items, match.matchId);
              log.success(`Finished saving videos for match: ${match.matchId}`);
              log.info('----------------------------------');
            }
          } else {
            log.default(
              'Match is not yet active, dont look for youtube videos'
            );
          }
        } else {
          log.default('Team is missing, dont look for youtube videos');
        }
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function main(dateFormatted) {
  return new Promise(async (resolve) => {
    // YOUTUBE VIDEOS UPDATE
    await forEachSeries(ytChannel, async (channel) => {
      log.title(channel.title);
      await findAndSaveYoutubeVideos(dateFormatted, channel.id);
    });

    resolve();
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
    // grab todays games and continue to update
    const todayDate = dayjs().subtract(1, 'd').format('YYYYMMDD');
    main(todayDate).then(() => {
      log.info('----------------------------------');
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
