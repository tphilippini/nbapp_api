import moment, { relativeTimeRounding } from "moment";
import mongoose from "mongoose";
import axios from "axios";
import { forEachSeries } from "p-iteration";

import log from "@/helpers/log";
import { db } from "@/config/config";

import Matches from "@/api/matches/match.model";
import Players from "@/api/players/player.model";
import Teams from "@/api/teams/team.model";
import MatchesStats from "@/api/matches-stats/match-stats.model";

import { findTodayMatches } from "@/scripts/api/nba";

let listStatsIds = [];

async function main(connection, dateFormatted) {
  return new Promise(async (resolve, reject) => {
    // MATCHES
    log.info("Finding today matches...");
    const todaysMatches = await findTodayMatches(dateFormatted);
    log.info(`Todays matches found : ${todaysMatches.length}`);
    if (todaysMatches.length > 0) {
      log.info("Finding teams...");
      const teams = await Teams.find({ isNBAFranchise: true });

      await forEachSeries(todaysMatches, async game => {
        const existingMatch = await Matches.findOne({
          matchId: game.gameId
        });

        // if match exists and it's not over, update it
        if (existingMatch && existingMatch.statusNum !== 3) {
          log.info("----------------------------------");
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info("Match exists, game is live, updating the record now...");
          existingMatch.isGameActivated = game.isGameActivated;
          existingMatch.nuggetText = game.nugget.text;
          existingMatch.hTeamScore = game.hTeam.score;
          existingMatch.vTeamScore = game.vTeam.score;
          existingMatch.statusNum = game.statusNum;
          existingMatch.hTeamWins = game.hTeam.win;
          existingMatch.hTeamLosses = game.hTeam.loss;
          existingMatch.vTeamWins = game.vTeam.win;
          existingMatch.vTeamLosses = game.vTeam.loss;
          existingMatch.currentPeriod = game.period.current;
          existingMatch.periodType = game.period.type;
          existingMatch.maxRegular = game.period.maxRegular;
          existingMatch.isHalfTime = game.period.isHalftime;
          existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;

          try {
            let data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(m => {
              log.success("Match is live, updated game info...");
            });
          } catch (error) {
            log.error("Match doesnt update, see error...");
            log.error(error);
          }
        } else if (existingMatch && existingMatch.statusNum === 3) {
          log.info("----------------------------------");
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info("Match exists, game is over, updating the record now...");
          existingMatch.endTimeUTC = game.endTimeUTC;
          existingMatch.isGameActivated = game.isGameActivated;
          existingMatch.nuggetText = game.nugget.text;
          existingMatch.currentPeriod = game.period.current;
          existingMatch.periodType = game.period.type;
          existingMatch.maxRegular = game.period.maxRegular;
          existingMatch.isHalfTime = game.period.isHalftime;
          existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;
          try {
            let data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(m => {
              log.success("Match updated...");
            });
          } catch (error) {
            log.error("Match doesnt update, see error...");
            log.error(error);
          }
        } else {
          log.info("----------------------------------");
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info("Match doesnt exist, creating new record now...");

          let hTeam = teams.find(t => t.teamTriCode === game.hTeam.triCode);
          let vTeam = teams.find(t => t.teamTriCode === game.vTeam.triCode);

          const match = {
            matchId: game.gameId,
            startDateEastern: game.startDateEastern,
            startTimeUTCString: game.startTimeUTC,
            startTimeUTC: new Date(game.startTimeUTC),
            endTimeUTC: game.endTimeUTC ? game.endTimeUTC : new Date(),
            isGameActivated: game.isGameActivated,
            hTeam: hTeam._id,
            hTeamId: game.hTeam.teamId,
            hTeamWins: game.hTeam.win,
            hTeamLosses: game.hTeam.loss,
            hTeamTriCode: game.hTeam.triCode,
            hTeamScore: game.hTeam.score,
            vTeam: vTeam._id,
            vTeamId: game.vTeam.teamId,
            vTeamWins: game.vTeam.win,
            vTeamLosses: game.vTeam.loss,
            vTeamTriCode: game.vTeam.triCode,
            vTeamScore: game.vTeam.score,
            statusNum: game.statusNum,
            nuggetText: game.nugget.text,
            currentPeriod: game.period.current,
            periodType: game.period.type,
            maxRegular: game.period.maxRegular,
            isHalfTime: game.period.isHalftime,
            isEndOfPeriod: game.period.isEndOfPeriod
          };

          try {
            let data = new Matches(match);
            await data.save().then(m => {
              log.success("Match saved...");
            });
          } catch (error) {
            log.error("Match doesnt save, see error...");
            log.error(error);
          }
        }
      });

      log.info("----------------------------------");
      await forEachSeries(todaysMatches, async game => {
        const existingMatch = await Matches.findOne({
          matchId: game.gameId
        });
        let url = `https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2019/boxscore/${game.gameId}.js`;

        // if match exists and has started or is over
        if (
          existingMatch &&
          (existingMatch.statusNum === 2 || existingMatch.statusNum === 3)
        ) {
          log.info("----------------------------------");
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info("Match exists, updating the record now...");

          let result = await axios.get(url);
          let statJSON = JSON.parse(result.data.split("var g_boxscore=")[1]);
          let homeTeamStats = statJSON.stats.home.players;
          let awayTeamStats = statJSON.stats.visitor.players;

          log.info("Saving players stats...");
          await saveStats(existingMatch, [...homeTeamStats, ...awayTeamStats]);

          existingMatch.gameClock = statJSON.score.periodTime.gameClock;
          existingMatch.hTeamScore = statJSON.score.home.score;
          existingMatch.vTeamScore = statJSON.score.visitor.score;

          // update the quarter scores
          existingMatch.hTeamQScore = statJSON.score.home.qScore;
          existingMatch.vTeamQScore = statJSON.score.visitor.qScore;

          try {
            let data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(m => {
              log.info("----------------------------------");
              log.success("Match is live, updated game info...");
            });
          } catch (error) {
            log.error("Match didnt start probably, see error...");
            log.error(error);
          }
        } else {
          log.info("----------------------------------");
          log.info("Match doesnt exist, didnt start probably...");
        }
      });
      log.info("----------------------------------");
      log.success("Match record save/update complete...");
    }

    resolve();
  });
}

async function saveStats(match, stats) {
  listStatsIds = [];
  await forEachSeries(stats, async stat => {
    return new Promise(async (resolve, reject) => {
      // find the player
      let player = await Players.findOne({ playerId: stat.id });
      // find the stats
      let existingMatchStat = await MatchesStats.findOne({
        playerIdFull: stat.id,
        matchIdFull: match.matchId
      });

      if (existingMatchStat) {
        log.info("----------------------------------");
        log.info("MatchStat exists, updating the record now...");
        existingMatchStat.statsJSON = stat;
        try {
          let existingMatchStatPlayer = new MatchesStats(existingMatchStat);
          await existingMatchStatPlayer.updateOne(existingMatchStat).then(m => {
            log.success(
              `updated stats for: ${player.name} matchId: ${match.matchId}`
            );
          });
        } catch (error) {
          log.error("MatchStat for player doesnt update, see error...");
          log.error(error);
        }
      } else {
        log.info("----------------------------------");
        log.info("MatchStat doesnt exist, creating new record now...");
        const matchStat = {
          matchIdFull: match.matchId,
          playerIdFull: stat.id,
          statsJSON: stat,
          player: player,
          match: match
        };

        try {
          let matchS = new MatchesStats(matchStat);
          await matchS.save().then(m => {
            log.success(
              `MatchStat saved for: ${player.name} matchId: ${match.matchId}`
            );
            // Update stats list in match for populate
            match.stats.push(m._id);
          });

          await match.save().then(e => {
            log.success("Saved stats in existing match...");
            log.info("----------------------------------");
          });
        } catch (error) {
          log.error("MatchStat doesnt save, see error...");
          log.error(error);
        }
      }
      resolve();
    });
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

    log.title("Initialization");
    log.info(`Connected to the database ${db().name}`);

    log.title("Main");
    // grab todays games and continue to update
    const todayDate =
      moment().hours() < 16
        ? moment()
            .subtract(1, "d")
            .format("YYYYMMDD")
        : moment().format("YYYYMMDD");
    main(connection, todayDate).then(() => {
      log.info("----------------------------------");
      log.info("Closed database connection");
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
