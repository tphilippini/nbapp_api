'use strict';

import EventEmitter from 'events';
import moment from 'moment';

import Matches from '@/api/matches/match.model';
import Teams from '@/api/teams/team.model';
import YoutubeVideos from '@/api/videos/youtube.model';

import log from '@/helpers/log';
import response from '@/helpers/response';

const matchController = {};

matchController.matchByDate = (req, res) => {
  log.info('Hi! Getting matches...');

  const date = req.params.startDate;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!date) {
      errors.push('missing_params');
    } else {
      if (!moment(date, 'yyyymmdd').isValid()) {
        errors.push('invalid_param_value');
      }

      if (errors.length === 0) {
        Matches.findMatchesByStartDate(date)
          .then(matches => {
            var len = matches.length;
            let curIdx = 0;
            let newMatches = [];

            if (len > 0) {
              matches.forEach(match => {
                Teams.findOneByTeamId(match.hTeamId).then(hres => {
                  match.hTeam = hres;
                  Teams.findOneByTeamId(match.vTeamId).then(vres => {
                    match.vTeam = vres;
                    YoutubeVideos.findYoutubeVideoByMatchID(match.matchId).then(
                      videos => {
                        match.youtubeVideos = videos;

                        newMatches.push(match);
                        ++curIdx;

                        if (curIdx == len) {
                          checkEvent.emit(
                            'success',
                            'result_found',
                            newMatches
                          );
                        }
                      }
                    );
                  });
                });
              });
            } else {
              checkEvent.emit('success', 'result_empty', newMatches);
            }
          })
          .catch(() => {
            errors.push('result_empty');
            checkEvent.emit('error', errors);
          });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', err => {
    response.error(res, 400, err);
  });

  checkEvent.on('success', (code, result) => {
    response.success(res, 200, code, ...result);
  });

  checking();
};

export default matchController;
