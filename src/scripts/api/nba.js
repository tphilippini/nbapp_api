import moment from 'moment';
import axios from 'axios';
import log from '../../helpers/log';

async function findTodayMatches(date) {
  return new Promise(async (resolve, reject) => {
    try {
      const uri = `https://data.nba.net/prod/v2/${date}/scoreboard.json`;
      log.success(uri);
      const matches = await axios.get(uri);
      resolve(matches.data.games);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function findTeams() {
  return new Promise(async (resolve, reject) => {
    try {
      const uri = `https://data.nba.net/prod/v2/2018/teams.json`;
      log.success(uri);
      const teams = await axios.get(uri);
      resolve(teams.data.league.standard);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function checkGameStatus(matches) {
  return new Promise(async resolve => {
    const notStarted = [];
    const active = [];
    const over = [];
    const overRecent = [];

    matches.forEach(match => {
      if (match.statusNum === 3) {
        // game is over
        // check how many hours ago it ended
        const postGameHours = (moment().diff(moment(match.endTimeUTC), 'hours'));
        if (postGameHours > '12') {
          over.push(match);
        } else {
          overRecent.push(match);
        }
      } else if (match.statusNum === 1) {
        // game hasn't started
        notStarted.push(match);
      } else if (match.statusNum === 2) {
        // game is active
        active.push(match);
      }
    });
    resolve({ notStarted, active, over, overRecent });
  });
}

export {
  findTodayMatches,
  findTeams,
  checkGameStatus
};