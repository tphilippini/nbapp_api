import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { google } from 'googleapis';

const { OAuth2 } = google.auth;

// Connect your app to google account to use YT api https://console.developers.google.com/apis/credentials?folder=&organizationId=&project=nba-api-238712
// Download client_secret.json from google account
// Run update:connect-youtube-api
// Generated token.json in /src/scripts/api
// - Copied ~/.credentials/youtube-nodejs-quickstart.json in token.json
// See https://developers.google.com/youtube/v3/quickstart/nodejs for more details
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = path.join(`${__dirname}/../api/`);
const TOKEN_PATH = `${TOKEN_DIR}token.json`;

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log(`Token stored to ${TOKEN_PATH}`);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  // eslint-disable-next-line prefer-destructuring
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  const service = google.youtube('v3');
  service.channels.list(
    {
      auth,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers',
    },
    (err, response) => {
      if (err) {
        console.log(`The API returned an error: ${err}`);
        return;
      }
      const channels = response.data.items;
      if (channels.length === 0) {
        console.log('No channel found.');
      } else {
        console.log(
          "This channel's ID is %s. Its title is '%s', and " +
            'it has %s views.',
          channels[0].id,
          channels[0].snippet.title,
          channels[0].statistics.viewCount
        );
      }
    }
  );
}

// Load client secrets from a local file.
fs.readFile(`${TOKEN_DIR}client_secret.json`, (err, content) => {
  if (err) {
    console.log(`Error loading client secret file: ${err}`);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), getChannel);
});
