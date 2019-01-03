// import moment from 'moment';
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

export {
  findTodayMatches,
  findTeams
};