import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { google } from 'googleapis';
var OAuth2 = google.auth.OAuth2;

import { youtube } from '@/config/config';
import log from '@/helpers/log';

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = path.join(__dirname);
const TOKEN_PATH = TOKEN_DIR + '/token.json';

async function videoFromChannel(channelId, query, gameStartTime) {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = await authorize();
      const videos = await searchChannel(auth, channelId, query, gameStartTime);
      resolve(videos.data);
    } catch (error) {
      reject(error);
    }
  });
}

function authorize() {
  return new Promise((resolve, reject) => {
    const clientSecret = youtube().client_secret;
    const clientId = youtube().client_id;
    const redirectUrl = youtube().redirect_uri;
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        log.error(err);
        getNewToken(oauth2Client, () => resolve(oauth2Client));
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  log.default('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        log.error('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
    if (err) throw err;
    log.success('Token stored to ' + TOKEN_PATH);
  });
  log.success('Token stored to ' + TOKEN_PATH);
}

function searchChannel(auth, channelId, q, publishedAfter) {
  return new Promise((resolve, reject) => {
    const service = google.youtube('v3');

    log.info(`Searching for video with, channelID: ${channelId}`);
    log.info(`Query: ${q}`);
    log.info(`PublishedAfter: ${publishedAfter}`);
    service.search.list(
      {
        auth,
        part: 'snippet',
        channelId,
        order: 'viewCount',
        maxResults: '50',
        publishedAfter,
        q
      },
      (err, response) => {
        if (err) {
          log.error(`The API returned an error:\n${err}`);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

module.exports = {
  videoFromChannel
};
