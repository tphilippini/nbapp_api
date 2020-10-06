/* eslint-disable no-underscore-dangle */
/* eslint-disable nonblock-statement-body-position */

'use strict';

import UUID from 'uuid';
import { isUUID } from 'validator';
import EventEmitter from 'events';

import Users from '@/api/users/user.model';
import Leagues from '@/api/leagues/league.model';

import log from '@/helpers/log';
import response from '@/helpers/response';
import { generatePassword } from '@/helpers/utils';

const leagueController = {};

leagueController.getByUser = (req, res) => {
  log.info('Hi! Getting leagues...');

  const { uuid } = req.params;
  const { user } = req;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];
    if (!uuid || !user.email || !user.user) {
      errors.push('missing_params');
    } else {
      if (!isUUID(uuid)) {
        errors.push('invalid_client');
      }

      if (errors.length === 0) {
        Users.findOneByUUID(uuid)
          .then((result) => {
            if (result && result.uuid === user.user) {
              Leagues.findLeaguesByObjectId(result._id).then((leagues) => {
                if (leagues.length > 0) {
                  checkEvent.emit('success', 'result_found', leagues);
                } else checkEvent.emit('success', 'result_empty', []);
              });
            } else {
              errors.push('invalid_credentials');
              checkEvent.emit('error', errors);
            }
          })
          .catch(() => {
            errors.push('invalid_credentials');
            checkEvent.emit('error', errors);
          });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', (err) => {
    response.error(res, 400, err);
  });

  checkEvent.on('success', (code, result) => {
    response.success(res, 200, code, ...result);
  });

  checking();
};

leagueController.post = (req, res) => {
  log.info('Hi! Adding a league...');

  // Creation de son equipe
  /**
   *  playerId,
   *  leagueId,
   *  name,
   *  shortName: {
        type: String,
        required: [true, "can't be blank"],
        minLength: [3, "Name is too short!"],
        maxLength: 3,
        match: [/^[-a-zA-Z0-9]+$/, "is invalid"]
      },
      roster: [ objectId, 'players'] //objet contenant les 6 joueurs de son équipe
      points
    */

  const uuid = req.user.user;
  const { name } = req.body;
  const { weeks } = req.body;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!uuid || !name || !weeks) {
      errors.push('missing_params');
    } else {
      if (!isUUID(uuid)) {
        errors.push('invalid_client');
      }

      if (errors.length === 0) {
        Users.findOneByUUID(uuid)
          .then((result) => {
            const league = new Leagues({
              name,
              weeks,
              leagueId: UUID.v4(),
              ownerId: result._id,
              password: generatePassword(),
            });
            league.players.push(result._id);
            checkEvent.emit('success', league);
          })
          .catch(() => {
            errors.push('invalid_credentials');
            checkEvent.emit('error', errors);
          });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit('error', errors);
    }
  };

  checkEvent.on('error', (err) => {
    response.error(res, 400, err);
  });

  checkEvent.on('success', (league) => {
    league.save((err) => {
      if (err) {
        const errors = [];
        errors.push('missing_params');
        response.error(res, 500, errors);
      }

      response.success(res, 200, 'league_added', {
        id: league.leagueId,
      });
    });
  });

  checking();
};

export default leagueController;
