import log from '@/helpers/log';
import { forEachSeries } from 'p-iteration';

async function saveMatchesOrUpdate(games, matchModel) {
  await forEachSeries(games, async game => {
    const existingMatch = await matchModel.findOne({ matchId: game.gameId });

    // if match exists and it's not over, update it
    if (existingMatch && existingMatch.statusNum !== 3) {
      log.info('----------------------------------');
      log.info(
        `${game.vTeam.triCode} ${game.vTeam.score} @ ${game.hTeam.score} ${game.hTeam.triCode}`
      );
      log.info('Match exists, game is live, updating the record now...');
      existingMatch.isGameActivated = game.isGameActivated;
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
        let data = new matchModel(existingMatch);
        await data.updateOne(existingMatch).then(m => {
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
      existingMatch.currentPeriod = game.period.current;
      existingMatch.periodType = game.period.type;
      existingMatch.maxRegular = game.period.maxRegular;
      existingMatch.isHalfTime = game.period.isHalftime;
      existingMatch.isEndOfPeriod = game.period.isEndOfPeriod;
      try {
        let data = new matchModel(existingMatch);
        await data.updateOne(existingMatch).then(m => {
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
      const match = {
        matchId: game.gameId,
        startDateEastern: game.startDateEastern,
        startTimeUTCString: game.startTimeUTC,
        startTimeUTC: new Date(game.startTimeUTC),
        endTimeUTC: game.endTimeUTC ? game.endTimeUTC : new Date(),
        isGameActivated: game.isGameActivated,
        hTeamId: game.hTeam.teamId,
        hTeamWins: game.hTeam.win,
        hTeamLosses: game.hTeam.loss,
        hTeamTriCode: game.hTeam.triCode,
        hTeamScore: game.hTeam.score,
        vTeamId: game.vTeam.teamId,
        vTeamWins: game.vTeam.win,
        vTeamLosses: game.vTeam.loss,
        vTeamTriCode: game.vTeam.triCode,
        vTeamScore: game.vTeam.score,
        statusNum: game.statusNum,
        currentPeriod: game.period.current,
        periodType: game.period.type,
        maxRegular: game.period.maxRegular,
        isHalfTime: game.period.isHalftime,
        isEndOfPeriod: game.period.isEndOfPeriod
      };

      try {
        let data = new matchModel(match);
        await data.save().then(m => {
          log.success('Match saved...');
        });
      } catch (error) {
        log.error('Match doesnt save, see error...');
        log.error(error);
      }
    }
  });
}

export { saveMatchesOrUpdate };
