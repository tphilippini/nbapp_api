import moment from "moment";
import mongoose from "mongoose";
import { forEachSeries } from "p-iteration";

import log from "@/helpers/log";
import { slug } from "@/helpers/utils";
import { db, ytChannel } from "@/config/config";
import { videoFromChannel } from "@/scripts/api/youtube";

import Matches from "@/api/matches/match.model";
import Teams from "@/api/teams/team.model";
import Players from "@/api/players/player.model";
import YoutubeVideos from "@/api/videos/youtube.model";

const limitHours = 13;

async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {
    // YOUTUBE VIDEOS UPDATE
    await forEachSeries(ytChannel, async (channel, i) => {
      log.title(channel.title);
      await findAndSaveYoutubeVideos(dateFormatted, channel.id);
    });

    resolve();
  });
}

function matchNotFresh(endTimeUTC) {
  // Average UTC time in US
  let now = moment().subtract("hours");
  // server time is UTC +0 hours
  let end = moment(endTimeUTC);
  // Time since game end
  let duration = moment.duration(now.diff(end));
  let hours = duration.asHours();
  // log.default(`Time since match ended: ${hours}`);
  return hours > limitHours;
}

async function findAndSaveYoutubeVideos(dateFormatted, channelId) {
  return new Promise(async (resolve, reject) => {
    try {
      log.info("----------------------------------");
      const todaysMatches = await Matches.find({
        startDateEastern: dateFormatted
      });
      log.success(`Found ${todaysMatches.length} matches.`);
      const teams = await Teams.find();

      await forEachSeries(todaysMatches, async match => {
        let hTeam = teams.find(t => t.teamTriCode === match.hTeamTriCode);
        let vTeam = teams.find(t => t.teamTriCode === match.vTeamTriCode);

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
              moment(match.startTimeUTCString).toISOString()
            );
            log.success(`Found ${videos.items.length} videos.`);

            if (videos.items.length > 0) {
              await saveVideosToDB(videos.items, match.matchId);
              log.success(`Finished saving videos for match: ${match.matchId}`);
              log.info("----------------------------------");
            }
          } else if (match.statusNum === 2) {
            log.default(hTeam.teamName, vTeam.teamName);
            log.default("Ready to look for videos, match is active");

            const videos = await videoFromChannel(
              channelId,
              `"${hTeam.teamName}"|"${hTeam.teamShortName}"|"${vTeam.teamName}"|"${vTeam.teamShortName}"`,
              moment(match.startTimeUTCString).toISOString()
            );
            log.success(`Found ${videos.items.length} videos.`);

            if (videos.items.length > 0) {
              await saveVideosToDB(videos.items, match.matchId);
              log.success(`Finished saving videos for match: ${match.matchId}`);
              log.info("----------------------------------");
            }
          } else {
            log.default(
              "Match is not yet active, dont look for youtube videos"
            );
          }
        } else {
          log.default("Team is missing, dont look for youtube videos");
        }
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function saveVideosToDB(videos, matchRecordId) {
  return new Promise(async (resolve, reject) => {
    await forEachSeries(videos, async video => {
      let exists = await YoutubeVideos.find({ videoId: video.id.videoId });
      if (exists.length === 1) {
        log.info(`Video ${video.id.videoId} exists already, skip`);
      } else {
        log.info(`${video.snippet.title}`);
        log.info(`Video doesn't exist, attempting to save video`);
        let { type, playerId, duelIds } = await determineVideoTypeFromTitle(
          video.snippet.title
        );

        const videoToSave = new YoutubeVideos();

        if (playerId) {
          let player1 = await Players.findOne({ playerId });
          videoToSave.players.push(player1._id);
        } else if (duelIds) {
          let player1 = await Players.findOne({ playerId: duelIds[0] });
          let player2 = await Players.findOne({ playerId: duelIds[1] });
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

        let existingMatch = await Matches.findOne({
          matchId: matchRecordId
        });
        videoToSave.match = existingMatch;

        try {
          await videoToSave.save().then(m => {
            log.success(`Youtube video saved for match ${matchRecordId}`);
            // Update videos list in match
            existingMatch.videos.push(m._id);
          });

          await existingMatch
            .save()
            .then(e => {
              log.success("Match record update complete...");
              log.info("----------------------------------");
            })
            .catch(error => {
              log.info("Match doesnt exist, didnt start probably...");
              log.error(error);
              log.info("----------------------------------");
            });
        } catch (error) {
          log.error("Youtube video doesnt save, see error...");
          log.error(error);
        }
      }
    });
    resolve();
  });
}

async function determineVideoTypeFromTitle(title) {
  let type;
  let playerId = undefined;
  let duelIds = undefined;
  let name = title.split(" ")[0] + " " + title.split(" ")[1];
  log.default(`Determine video type for ${name}`);

  let titleLowerCase = title.toLowerCase();
  if (titleLowerCase.includes("interview")) {
    let player = await Players.find({ name: name });

    if (player.length === 1) {
      type = `interview ${name}`;
      playerId = player[0].playerId;
    } else {
      type = "interview unidentified";
    }

    if (titleLowerCase.includes("postgame")) {
      type = type + " postgame";
    } else if (titleLowerCase.includes("pregame")) {
      type = type + " pregame";
    }
  } else if (titleLowerCase.includes("highlights")) {
    type = "highlights";
    if (titleLowerCase.includes("pts") || titleLowerCase.includes("points")) {
      // if it's a player highlight, try to figure out which player it is.
      let player = await Players.find({ name: name });

      if (player.length === 1) {
        type = `player highlights ${name}`;
        playerId = player[0].playerId;
      } else {
        type = "player highlights unidentified";
      }
    } else if (
      titleLowerCase.includes("full game") ||
      title.includes("full highlights")
    ) {
      type = "full game highlights";
    } else if (titleLowerCase.includes("1st qtr")) {
      type = "first quarter highlights";
    } else if (titleLowerCase.includes("1st half")) {
      type = "first half highlights";
    } else if (
      titleLowerCase.includes("duel") ||
      titleLowerCase.includes("battle")
    ) {
      type = "duel highlights";

      // determine id of both players in the duel
      // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
      let player1Name = title.split("vs")[0].slice(0, -1);
      let player2Name = "";
      if (title.split("vs")[1]) {
        player2Name =
          title.split("vs")[1].split(" ")[1] +
          " " +
          title.split("vs")[1].split(" ")[2];
      }

      let player1 = await Players.find({ name: player1Name });
      let player2 = await Players.find({ name: player2Name });

      // if both players can be identified, send back duelIds for each so they are saved in ManyToMany relationship.
      if (player1.length === 1 && player2.length === 1) {
        duelIds = [player1[0].playerId, player2[0].playerId];
      } else if (player1.length === 1) {
        playerId = player1[0].playerId;
      } else if (player2.length === 1) {
        playerId = player2[0].playerId;
      }
    }
  } else if (
    titleLowerCase.includes("duel") ||
    titleLowerCase.includes("battle")
  ) {
    type = "duel highlights";

    // determine id of both players in the duel
    // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
    let player1Name = title.split("vs")[0].slice(0, -1);
    let player2Name = "";
    if (title.split("vs")[1]) {
      player2Name =
        title.split("vs")[1].split(" ")[1] +
        " " +
        title.split("vs")[1].split(" ")[2];
    }

    let player1 = await Players.find({ name: player1Name });
    let player2 = await Players.find({ name: player2Name });

    // if both players can be identified, send back duelIds for each so they are saved in ManyToMany relationship.
    if (player1.length === 1 && player2.length === 1) {
      duelIds = [player1[0].playerId, player2[0].playerId];
    } else if (player1.length === 1) {
      playerId = player1[0].playerId;
    } else if (player2.length === 1) {
      playerId = player2[0].playerId;
    }
  } else if (titleLowerCase.includes("&")) {
    type = "team highlights";

    // determine id of both players in the duel
    // CARE THIS IS VERY SPECIFIC, COULD BREAK EASILY BASED ON YOUTUBE TITLE
    let player1Name = title.split("&")[0].slice(0, -1);
    let player2Name =
      title.split("&")[1].split(" ")[1] +
      " " +
      title.split("&")[1].split(" ")[2];

    let player1 = await Players.find({ name: player1Name });
    let player2 = await Players.find({ name: player2Name });

    // if both players can be identified, send back duelIds for each so they are saved in ManyToMany relationship.
    if (player1.length === 1 && player2.length === 1) {
      duelIds = [player1[0].playerId, player2[0].playerId];
    } else if (player1.length === 1) {
      playerId = player1[0].playerId;
    } else if (player2.length === 1) {
      playerId = player2[0].playerId;
    }
  } else {
    type = "highlights";
  }
  return { type, playerId, duelIds };
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

    log.title("Initialization");
    log.info(`Connected to the database ${db().name}`);

    log.title("Main");
    // grab todays games and continue to update
    const todayDate = moment()
      .subtract(1, "d")
      .format("YYYYMMDD");
    main(connection, todayDate).then(() => {
      log.info("----------------------------------");
      log.info("Closed database connection");
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
