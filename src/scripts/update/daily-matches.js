/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import axios from 'axios';
import { forEachSeries } from 'p-iteration';

import log from '@/helpers/log';

import Matches from '@/api/matches/match.model';
import Players from '@/api/players/player.model';
import Teams from '@/api/teams/team.model';
import MatchesStats from '@/api/matches-stats/match-stats.model';

import { findTodayMatches } from '@/scripts/api/nba';

require('dotenv').config();

async function saveStats(match, stats) {
  await forEachSeries(
    stats,
    async (stat) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      new Promise(async (resolve) => {
        // find the player
        const player = await Players.findOne({ playerId: stat.id });
        // find the stats
        const existingMatchStat = await MatchesStats.findOne({
          playerIdFull: stat.id,
          matchIdFull: match.matchId,
        });

        if (existingMatchStat) {
          log.info('----------------------------------');
          log.info('MatchStat exists, updating the record now...');
          existingMatchStat.statsJSON = stat;
          try {
            const existingMatchStatPlayer = new MatchesStats(existingMatchStat);
            await existingMatchStatPlayer
              .updateOne(existingMatchStat)
              .then(() => {
                log.success(
                  `updated stats for: ${player.name} matchId: ${match.matchId}`
                );
              });
          } catch (error) {
            log.error('MatchStat for player doesnt update, see error...');
            log.error(error);
          }
        } else {
          log.info('----------------------------------');
          log.info('MatchStat doesnt exist, creating new record now...');
          const matchStat = {
            matchIdFull: match.matchId,
            playerIdFull: stat.id,
            statsJSON: stat,
            player,
            match,
          };

          try {
            const matchS = new MatchesStats(matchStat);
            await matchS.save().then((m) => {
              log.success(
                `MatchStat saved for: ${player.name} matchId: ${match.matchId}`
              );
              // Update stats list in match for populate
              match.stats.push(m._id);
            });

            await match.save().then(() => {
              log.success('Saved stats in existing match...');
              log.info('----------------------------------');
            });
          } catch (error) {
            log.error('MatchStat doesnt save, see error...');
            log.error(error);
          }
        }
        resolve();
      })
  );
}

async function main(dateFormatted) {
  return new Promise(async (resolve) => {
    // MATCHES
    log.info('Finding today matches...');
    const todaysMatches = await findTodayMatches(dateFormatted);
    log.info(`Todays matches found : ${todaysMatches.length}`);
    if (todaysMatches.length > 0) {
      log.info('Finding teams...');
      const teams = await Teams.find({ isNBAFranchise: true });

      await forEachSeries(todaysMatches, async (game) => {
        const existingMatch = await Matches.findOne({
          matchId: game.gameId,
        });

        // if match exists and it's not over, update it
        if (existingMatch && existingMatch.statusNum !== 3) {
          log.info('----------------------------------');
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info('Match exists, game is live, updating the record now...');
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
            const data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(() => {
              log.success('Match is live, updated game info...');
            });
          } catch (error) {
            log.error('Match doesnt update, see error...');
            log.error(error);
          }
        } else if (existingMatch && existingMatch.statusNum === 3) {
          log.info('----------------------------------');
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info('Match exists, game is over, updating the record now...');
          existingMatch.endTimeUTC = game.endTimeUTC;
          existingMatch.isGameActivated = game.isGameActivated;
          existingMatch.nuggetText = game.nugget.text;
          existingMatch.currentPeriod = game.period.current;
          existingMatch.periodType = game.period.type;
          existingMatch.maxRegular = game.period.maxRegular;
          existingMatch.isHalfTime = game.period.isHalftime;
          existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;
          try {
            const data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(() => {
              log.success('Match updated...');
            });
          } catch (error) {
            log.error('Match doesnt update, see error...');
            log.error(error);
          }
        } else {
          log.info('----------------------------------');
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info('Match doesnt exist, creating new record now...');

          const hTeam = teams.find((t) => t.teamTriCode === game.hTeam.triCode);
          const vTeam = teams.find((t) => t.teamTriCode === game.vTeam.triCode);

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
            isEndOfPeriod: game.period.isEndOfPeriod,
          };

          try {
            const data = new Matches(match);
            await data.save().then(() => {
              log.success('Match saved...');
            });
          } catch (error) {
            log.error('Match doesnt save, see error...');
            log.error(error);
          }
        }
      });

      log.info('----------------------------------');
      await forEachSeries(todaysMatches, async (game) => {
        const existingMatch = await Matches.findOne({
          matchId: game.gameId,
        });
        const url = `https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2019/boxscore/${game.gameId}.js`;
        // log.success(url);
        // if match exists and has started or is over
        if (
          existingMatch &&
          (existingMatch.statusNum === 2 || existingMatch.statusNum === 3)
        ) {
          log.info('----------------------------------');
          log.info(
            `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
          );
          log.info('Match exists, updating the record now...');

          const result = await axios.get(url);
          const statJSON = JSON.parse(result.data.split('var g_boxscore=')[1]);
          const homeTeamStats = statJSON.stats.home.players;
          const awayTeamStats = statJSON.stats.visitor.players;

          log.info('Saving players stats...');
          await saveStats(existingMatch, [...homeTeamStats, ...awayTeamStats]);

          existingMatch.gameClock = statJSON.score.periodTime.gameClock;
          existingMatch.hTeamScore = statJSON.score.home.score;
          existingMatch.vTeamScore = statJSON.score.visitor.score;

          // update the quarter scores
          existingMatch.hTeamQScore = statJSON.score.home.qScore;
          existingMatch.vTeamQScore = statJSON.score.visitor.qScore;

          try {
            const data = new Matches(existingMatch);
            await data.updateOne(existingMatch).then(() => {
              log.info('----------------------------------');
              log.success('Match is live, updated game info...');
            });
          } catch (error) {
            log.error('Match didnt start probably, see error...');
            log.error(error);
          }
        } else {
          log.info('----------------------------------');
          log.info('Match doesnt exist, didnt start probably...');
        }
      });
      log.info('----------------------------------');
      log.success('Match record save/update complete...');
    }

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
    const todayDate =
      dayjs().hour() < 16
        ? dayjs().subtract(1, 'd').format('YYYYMMDD')
        : dayjs().format('YYYYMMDD');
    main(todayDate).then(() => {
      log.info('----------------------------------');
      log.info('Closed database connection');
      connection.close();
      // setInterval( () => mainLoop(connection, dateFormatted, date), 20000);
    });
  }
);
