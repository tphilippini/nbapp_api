import axios from 'axios';
import dayjs from 'dayjs';
import fetch from 'node-fetch';
import log from '@/helpers/log';
import { sum } from '@/helpers/utils';

// Stats personId:
// http://data.nba.net/data/10s/prod/v1/2019/players/2544_profile.json
// https://basketinfo.com/L-evaluation-des-joueurs-comment.html
/**
EFF = [ (( PTS+REB+PD+INT+BLOC )) + (( TT-TM ) + ( LFT-LFM ) - BP )) ] / MJ

- EFF : efficiency : évaluation

- PTS : nombre total de points marqués dans une compétition

- REB : nombre total de rebonds pris dans une compétition

- PD ( AST ) : nombre de passes décisives dans une compétition

- INT ( STL ) : nombre total d’interceptions dans une compétition

- BLOC ( BLK ) : nombre total de contres dans une compétition

- TT ( FGA ) : nombre de tirs tentés dans une compétition

- TM ( FGM ) : nombre total de tirs ratés dans une compétition

- LFT ( FTA ) : nombre total de lancers tentés dans une compétition

- LFM ( FTM ) : nombre totale de lancers ratés dans une compétition

- BP ( TO ) : nombre totale de balles perdues dans une compétition

- MJ ( G ) : nombre de matches joués dans une compétition
*/

// https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json
// https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022000180.json
// https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_{game_id}.json

// https://stats.nba.com/stats/{endpoint}
// https://cdn.nba.com/static/json/liveData/{endpoint}
// https://en.global.nba.com/stats2/scores/daily.json?gameDate=2022-11-16

const year = '2023';

async function findTodayMatches(date) {
  return new Promise(async (resolve, reject) => {
    try {
      // const uri = `https://data.nba.net/prod/v2/${date}/scoreboard.json`;
      const uri = `https://en.global.nba.com/stats2/scores/daily.json?gameDate=${date}`;
      log.success(uri);
      const response = await fetch(uri);
      const matches = await response.json();
      resolve(matches.payload.date);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function findTeams() {
  return new Promise(async (resolve, reject) => {
    try {
      // const uri = `https://data.nba.net/prod/v2/${dayjs().format(
      //   "Y"
      // )}/teams.json`;
      const uri =
        'https://en.global.nba.com/stats2/league/conferenceteamlist.json';
      log.success(uri);
      const response = await fetch(uri);
      const teams = await response.json();
      resolve(teams.payload.listGroups);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function checkTeamRoster(teamShortName) {
  return new Promise(async (resolve, reject) => {
    try {
      // const uri = `https://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2019-20&TeamID=${teamId}`;
      // /prod/v1/2019/teams/{{teamUrlCode}}/roster.json
      // https://data.nba.net/prod/v1/2019/players.json
      const uri = `https://data.nba.net/data/json/cms/${year}/team/${teamShortName}/roster.json`;
      log.success(uri);
      const roster = await axios.get(uri);
      resolve(roster.data.sports_content.roster.players.player);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function checkPlayers() {
  return new Promise(async (resolve, reject) => {
    try {
      // const uri = `https://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2019-20&TeamID=${teamId}`;
      // /prod/v1/2019/teams/{{teamUrlCode}}/roster.json
      // https://data.nba.net/prod/v1/2019/players.json
      // https://en.global.nba.com/stats2/league/playerlist.json
      const uri = `https://data.nba.net/prod/v1/${year}/players.json`;
      log.success(uri);
      const roster = await axios.get(uri);
      resolve(roster.data.league.standard);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function checkGameStatus(matches) {
  return new Promise(async (resolve) => {
    const notStarted = [];
    const active = [];
    const over = [];
    const overRecent = [];

    matches.forEach((match) => {
      if (match.statusNum === 3) {
        // game is over
        // check how many hours ago it ended
        const postGameHours = dayjs().diff(dayjs(match.endTimeUTC), 'hours');
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
    resolve({
      notStarted,
      active,
      over,
      overRecent,
    });
  });
}

async function checkBoxScore(dateFormatted, gameId) {
  return new Promise(async (resolve, reject) => {
    try {
      // A tester : http://data.nba.net/10s/prod/v1/20210126/0022000268_boxscore.json
      // Example : https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2019/boxscore/0041900205.js WORKS !!!
      // const url = `https://nlnbamdnyc-a.akamaihd.net/fs/nba/feeds_s2012/stats/2020/boxscore/${game.gameId}.js`;
      const uri = `http://data.nba.net/10s/prod/v1/${dateFormatted}/${gameId}_boxscore.json`;
      log.success(uri);
      const boxscore = await axios.get(uri);
      resolve(boxscore.data);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

async function findPlayerLatestStats(playerId) {
  return new Promise(async (resolve, reject) => {
    try {
      const uri = `http://data.nba.net/data/10s/prod/v1/${year}/players/${playerId}_profile.json`;
      log.success(uri);
      const profile = await axios.get(uri);
      const { latest } = profile.data.league.standard.stats;
      resolve(latest);
    } catch (error) {
      log.error(error);
      reject(error);
    }
  });
}

function calcEfficiency(stats) {
  const sumBonus = sum([
    stats.points,
    stats.totReb,
    stats.assists,
    stats.steals,
    stats.blocks,
  ]);
  const missedFG = parseFloat(stats.fga) - parseFloat(stats.fgm);
  const missedFT = parseFloat(stats.fta) - parseFloat(stats.ftm);

  // eslint-disable-next-line operator-linebreak
  const efficiency =
    // eslint-disable-next-line operator-linebreak
    (sumBonus - missedFG - missedFT - parseFloat(stats.turnovers)) /
    stats.gamesPlayed;
  return Math.round(efficiency * 100) / 100;
}

/**
  Efficiency table
  All-time great season                 35.0+
  Runaway MVP candidate                 30.0–35.0 => 10
  Strong MVP candidate                  27.5–30.0 => 9
  Weak MVP candidate                    25.0–27.5 => 8
  Definite All-Star                     22.5–25.0
  Borderline All-Star                   20.0–22.5 => 7
  Second offensive option               18.0–20.0 => 6
  Third offensive option                16.5–18.0 => 5
  Slightly above-average player         15.0–16.5 => 4
  Rotation player                       13.0–15.0 => 3
  Non-rotation player                   11.0–13.0 => 2
  Fringe roster player                  9.0–11.0
  Player who won't stick in the league  0–9.0 => 1
*/

function calcNotation(eff) {
  let notation = 1;
  switch (true) {
    case eff < 11.0:
      notation = 1;
      break;
    case eff >= 11.0 && eff < 13.0:
      notation = 2;
      break;
    case eff >= 13.0 && eff < 15.0:
      notation = 3;
      break;
    case eff >= 15.0 && eff < 16.5:
      notation = 4;
      break;
    case eff >= 16.5 && eff < 18.0:
      notation = 5;
      break;
    case eff >= 18.0 && eff < 20.0:
      notation = 6;
      break;
    case eff >= 20.0 && eff < 25.0:
      notation = 7;
      break;
    case eff >= 25.0 && eff < 27.5:
      notation = 8;
      break;
    case eff >= 27.5 && eff < 30.0:
      notation = 9;
      break;
    case eff >= 30.0:
      notation = 10;
      break;

    default:
      break;
  }

  return notation;
}

export {
  findTodayMatches,
  findTeams,
  checkGameStatus,
  checkTeamRoster,
  checkPlayers,
  checkBoxScore,
  findPlayerLatestStats,
  calcEfficiency,
  calcNotation,
};
