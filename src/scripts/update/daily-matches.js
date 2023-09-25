import dayjs from 'dayjs';
import { forEachSeries } from 'p-iteration';
import mongoose from 'mongoose';
import Matches from '@/api/matches/match.model';
// import MatchesStats from '@/api/matches-stats/match-stats.model';
// import Players from '@/api/players/player.model';
import Teams from '@/api/teams/team.model';
// import { checkBoxScore, findTodayMatches } from '@/scripts/api/nba';
import { findTodayMatches } from '@/scripts/api/nba';
/* eslint-disable no-underscore-dangle */
import log from '@/helpers/log';

require('dotenv').config();

// async function saveStats(match, stats) {
//   await forEachSeries(
//     stats,
//     async (stat) =>
//       // eslint-disable-next-line implicit-arrow-linebreak
//       new Promise(async (resolve) => {
//         // find the player
//         const player = await Players.findOne({ playerId: stat.personId });
//         // find the stats
//         const existingMatchStat = await MatchesStats.findOne({
//           playerIdFull: stat.personId,
//           matchIdFull: match.matchId,
//         });

//         if (existingMatchStat) {
//           log.info('----------------------------------');
//           log.info('MatchStat exists, updating the record now...');
//           existingMatchStat.statsJSON = {
//             p: parseInt(stat.points, 10),
//             a: parseInt(stat.assists, 10),
//             or: parseInt(stat.offReb, 10),
//             dr: parseInt(stat.defReb, 10),
//             b: parseInt(stat.blocks, 10),
//             min: stat.min,
//             s: parseInt(stat.steals, 10),
//             fgm: parseInt(stat.fgm, 10),
//             fga: parseInt(stat.fga, 10),
//             tm: parseInt(stat.tpm, 10),
//             ta: parseInt(stat.tpa, 10),
//           };
//           try {
//             const existingMatchStatPlayer = new MatchesStats(existingMatchStat);
//             await existingMatchStatPlayer
//               .updateOne(existingMatchStat)
//               .then(() => {
//                 log.success(
//                   `updated stats for: ${player.name} matchId: ${match.matchId}`
//                 );
//               });
//           } catch (error) {
//             log.error('MatchStat for player doesnt update, see error...');
//             log.error(error);
//           }
//         } else {
//           log.info('----------------------------------');
//           log.info('MatchStat doesnt exist, creating new record now...');
//           const matchStat = {
//             matchIdFull: match.matchId,
//             playerIdFull: stat.personId,
//             statsJSON: {
//               p: parseInt(stat.points, 10),
//               a: parseInt(stat.assists, 10),
//               or: parseInt(stat.offReb, 10),
//               dr: parseInt(stat.defReb, 10),
//               b: parseInt(stat.blocks, 10),
//               min: stat.min,
//               s: parseInt(stat.steals, 10),
//               fgm: parseInt(stat.fgm, 10),
//               fga: parseInt(stat.fga, 10),
//               tm: parseInt(stat.tpm, 10),
//               ta: parseInt(stat.tpa, 10),
//             },
//             player,
//             match,
//           };

//           try {
//             const matchS = new MatchesStats(matchStat);
//             await matchS.save().then((m) => {
//               log.success(
//                 `MatchStat saved for: ${player.name} matchId: ${match.matchId}`
//               );
//               // Update stats list in match for populate
//               match.stats.push(m._id);
//             });

//             await match.save().then(() => {
//               log.success('Saved stats in existing match...');
//               log.info('----------------------------------');
//             });
//           } catch (error) {
//             log.error('MatchStat doesnt save, see error...');
//             log.error(error);
//           }
//         }
//         resolve();
//       })
//   );
// }

async function main(dateFormatted) {
  return new Promise(async (resolve) => {
    // MATCHES
    log.info('Finding today matches...');
    const todaysMatches = await findTodayMatches(dateFormatted);
    log.info(`Todays matches found : ${todaysMatches?.games.length || 0}`);
    if (todaysMatches && todaysMatches.games.length > 0) {
      log.info('Finding teams...');
      const teams = await Teams.find({ isNBAFranchise: true });

      await forEachSeries(todaysMatches.games, async (game) => {
        log.info('----------------------------------');
        log.info(
          `${game.awayTeam.profile.abbr} ${game.boxscore.awayScore} @ ${game.boxscore.homeScore} ${game.homeTeam.profile.abbr}`
        );

        const existingMatch = await Matches.findOne({
          matchId: game.profile.gameId,
        });

        // if match exists and it's not over, update it
        if (existingMatch && existingMatch.statusNum !== 3) {
          log.info('Match exists, game is live, updating the record now...');
          // existingMatch.isGameActivated = true;
          // existingMatch.nuggetText = '';
          existingMatch.hTeamScore = game.boxscore.homeScore;
          existingMatch.vTeamScore = game.boxscore.awayScore;
          existingMatch.statusNum = game.boxscore.status;
          existingMatch.hTeamWins = game.homeTeam.matchup.wins;
          existingMatch.hTeamLosses = game.homeTeam.matchup.losses;
          existingMatch.vTeamWins = game.awayTeam.matchup.wins;
          existingMatch.vTeamLosses = game.awayTeam.matchup.losses;
          existingMatch.currentPeriod = game.boxscore.period;
          //       existingMatch.periodType = game.period.type;
          //       existingMatch.maxRegular = game.period.maxRegular;
          //       existingMatch.isHalfTime = game.period.isHalftime;
          //       existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;

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
          log.info('Match exists, game is over, updating the record now...');
          //       existingMatch.endTimeUTC = game.endTimeUTC;

          //       existingMatch.isGameActivated = false;
          //       existingMatch.nuggetText = game.nugget.text;
          existingMatch.hTeamScore = game.boxscore.homeScore;
          existingMatch.vTeamScore = game.boxscore.awayScore;
          existingMatch.statusNum = game.boxscore.status;
          existingMatch.hTeamWins = game.homeTeam.matchup.wins;
          existingMatch.hTeamLosses = game.homeTeam.matchup.losses;
          existingMatch.vTeamWins = game.awayTeam.matchup.wins;
          existingMatch.vTeamLosses = game.awayTeam.matchup.losses;
          existingMatch.currentPeriod = game.boxscore.period;
          //       existingMatch.periodType = game.period.type;
          //       existingMatch.maxRegular = game.period.maxRegular;
          //       existingMatch.isHalfTime = game.period.isHalftime;
          //       existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;

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
          log.info('Match doesnt exist, creating new record now...');
          const hTeam = teams.find(
            (t) => t.teamTriCode === game.homeTeam.profile.abbr
          );
          const vTeam = teams.find(
            (t) => t.teamTriCode === game.awayTeam.profile.abbr
          );

          const match = {
            matchId: game.profile.gameId,
            startDateEastern: game.profile.dateTimeEt,
            startTimeUTCString: new Date(game.profile.dateTimeEt).getUTCDate(),
            startTimeUTC: new Date(game.profile.dateTimeEt).getUTCDate(),
            //         endTimeUTC: game.endTimeUTC ? game.endTimeUTC : new Date(),
            //         isGameActivated: game.isGameActivated,
            hTeam: hTeam._id,
            hTeamId: game.homeTeam.profile.id,
            hTeamWins: game.homeTeam.matchup.wins,
            hTeamLosses: game.homeTeam.matchup.losses,
            hTeamTriCode: game.homeTeam.profile.abbr,
            hTeamScore: game.boxscore.homeScore,
            vTeam: vTeam._id,
            vTeamId: game.homeTeam.profile.id,
            vTeamWins: game.awayTeam.matchup.wins,
            vTeamLosses: game.awayTeam.matchup.losses,
            vTeamTriCode: game.awayTeam.profile.abbr,
            vTeamScore: game.boxscore.awayScore,
            statusNum: game.boxscore.status,
            //         nuggetText: game.nugget.text,
            currentPeriod: game.boxscore.period,
            //         periodType: game.period.type,
            //         maxRegular: game.period.maxRegular,
            //         isHalfTime: game.period.isHalftime,
            //         isEndOfPeriod: game.period.isEndOfPeriod,
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

      //   log.info('----------------------------------');
      //   await forEachSeries(todaysMatches, async (game) => {
      //     const existingMatch = await Matches.findOne({
      //       matchId: game.gameId,
      //     });
      //     // if match exists and has started or is over
      //     if (
      //       existingMatch &&
      //       (existingMatch.statusNum === 2 || existingMatch.statusNum === 3)
      //     ) {
      //       log.info('Match exists, updating the record now...');
      //       const result = await checkBoxScore(dateFormatted, game.gameId);
      //       log.info('Saving players stats...');
      //       await saveStats(existingMatch, result.stats.activePlayers);
      //       existingMatch.gameClock = result.basicGameData.clock;
      //       existingMatch.hTeamScore = result.basicGameData.hTeam.score;
      //       existingMatch.vTeamScore = result.basicGameData.vTeam.score;
      //       // update the quarter scores
      //       existingMatch.hTeamQScore = result.basicGameData.hTeam.linescore.map(
      //         (item) => item.score
      //       );
      //       existingMatch.vTeamQScore = result.basicGameData.vTeam.linescore.map(
      //         (item) => item.score
      //       );
      //       try {
      //         const data = new Matches(existingMatch);
      //         await data.updateOne(existingMatch).then(() => {
      //           log.info('----------------------------------');
      //           log.success('Match is live, updated game info...');
      //         });
      //       } catch (error) {
      //         log.error('Match didnt start probably, see error...');
      //         log.error(error);
      //       }
      //     } else {
      //       log.info('----------------------------------');
      //       log.info('Match doesnt exist, didnt start probably...');
      //     }
      //   });
      //   log.info('----------------------------------');
      //   log.success('Match record save/update complete...');
    }

    resolve();
  });
}

(async () => {
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

  log.title('Initialization');
  const { connection } = mongoose;
  connection.once('open', () => {
    log.success(`Hi! Connecting to the database ${process.env.DB_NAME}`);
  });
  connection.once('close', () => {
    log.success(`Hi! Disconnected to the database ${process.env.DB_NAME}`);
  });
  connection.on('error', (err) => {
    log.error(`Connection error to the database ${process.env.DB_NAME}`);
    if (err) {
      log.default(err.message);
    }
    process.exit(1);
  });

  log.title('Main');
  // grab todays games and continue to update
  const todayDate =
    dayjs().hour() < 15
      ? dayjs().subtract(1, 'd').format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  log.info(`Running matches on ${todayDate}`);

  await main(todayDate).then(() => {
    log.info('----------------------------------');
    log.info('Closed database connection');
    connection.close();
  });
})();
