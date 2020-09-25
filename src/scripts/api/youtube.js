import { google } from 'googleapis';
import log from '@/helpers/log';

// Check YOUTUBE_API_KEY https://console.developers.google.com/apis/credentials?folder=&organizationId=&project=nba-api-238712
// See limit
// Example video : https://www.youtube.com/watch?v=QZ4BXGgmATU&ab_channel=AnsontheDeveloper

function searchChannel(channelId, q, publishedAfter) {
  return new Promise((resolve, reject) => {
    const service = google.youtube('v3');

    log.info(`Searching for video with, channelID: ${channelId}`);
    log.info(`Query: ${q}`);
    log.info(`PublishedAfter: ${publishedAfter}`);
    service.search.list(
      {
        key: process.env.API_YOUTUBE_TOKEN,
        part: 'snippet',
        channelId,
        order: 'viewCount',
        maxResults: '50',
        publishedAfter,
        q,
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

async function videoFromChannel(channelId, query, gameStartTime) {
  return new Promise(async (resolve, reject) => {
    try {
      const videos = await searchChannel(channelId, query, gameStartTime);
      resolve(videos.data);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  videoFromChannel,
};
