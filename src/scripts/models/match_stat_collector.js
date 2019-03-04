import axios from 'axios';

import log from '../helpers/log';
import { forEachSeries } from 'p-iteration';

async function matchStatCollector(games, matchModel, matchStatModel, playerModel) {
  return new Promise(async (resolve, reject) => {
    await forEachSeries(games, async game => {
      try {
        const existingMatch = await matchModel.findOne({ matchId: game.gameId });

        // if match exists and has started and is not over
        if (existingMatch && existingMatch.statusNum === 2) {
          log.info('----------------------------------');
          log.info('Match exists, game is live, updating the record now...');
          
          let result = await axios.get(
            `https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2018/boxscore/${
              game.gameId
            }.js`,
          );

          let statJSON = JSON.parse(result.data.split('var g_boxscore=')[1]);
          let homeTeamStats = statJSON.stats.home.players;
          let awayTeamStats = statJSON.stats.visitor.players;

          log.info('Saving players stats...');
          await saveStats(
            existingMatch,
            [...homeTeamStats, ...awayTeamStats],
            playerModel,
            matchStatModel,
          );

          existingMatch.gameClock = statJSON.score.periodTime.gameClock;
          existingMatch.hTeamScore = statJSON.score.home.score;
          existingMatch.vTeamScore = statJSON.score.visitor.score;

          // update the quarter scores
          existingMatch.hTeamQScore = statJSON.score.home.qScore;
          existingMatch.vTeamQScore = statJSON.score.visitor.qScore;

          try {
            let data = new matchModel();
            await data.updateOne(existingMatch).then(m => {
              log.success('Match is live, updated game info...');
            });
          } catch (error) {
            log.error('Match doesnt update, see error...');
            log.error(error);
          }
        }
      } catch (error) {
        log.error('Match didnt start probably, see error...');
        log.error(error);
      }
    });
    log.info('----------------------------------');
    resolve();
  });
}

export default matchStatCollector;

async function saveStats(match, stats, playerModel, matchStatModel) {
  return new Promise(async (resolve, reject) => {
    await forEachSeries(stats, async stat => {
      return new Promise(async (resolve, reject) => {
        // find the player
        let player = await playerModel.findOne({ playerId: stat.id });
        // find the stats
        let existingMatchStat = await matchStatModel.findOne({ playerIdFull: stat.id, matchIdFull: match.matchId });

        if (existingMatchStat) {
          log.info('----------------------------------');
          log.info('MatchStat exists, updating the record now...');
          existingMatchStat.statsJSON = stat;
          try {
            let existingMatchStatPlayer = new matchStatModel(existingMatchStat);
            await existingMatchStatPlayer.updateOne(existingMatchStat).then(m => {
              log.success(`updated stats for: ${player.name} matchId: ${match.matchId}`);
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
            player: player,
            match: match,
          };

          try {
            let matchS = new matchStatModel(matchStat);
            await matchS.save().then(m => {
              log.success(`MatchStat saved for: ${player.name} matchId: ${match.matchId}`);
            });
          } catch (error) {
            log.error('MatchStat doesnt save, see error...');
            log.error(error);
          }
        }
        resolve();
      });
    });
    resolve();
  });
}
