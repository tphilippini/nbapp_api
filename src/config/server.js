'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import mongoose from 'mongoose';

import passport from '@/config/passport';

import { version } from '@@/package.json';

import corsMidd from '@/middlewares/cors';
import otherMidd from '@/middlewares/other';
import authErrorMidd from '@/middlewares/authError';

import deviceRouter from '@/api/devices/device.routes';
import userRouter from '@/api/users/user.routes';
import matchRouter from '@/api/matches/match.routes';
import leagueRouter from '@/api/leagues/league.routes';
import authRouter from '@/api/auth/auth.routes';

import log from '@/helpers/log';

const app = express();

class Server {
  constructor() {
    this.server = {};
  }

  static init() {
    return new Promise(async (resolve) => {
      // Global middlewares

      // CORS middleware
      app.use(corsMidd);

      // A simple middleware
      app.use(otherMidd);

      // Parse input values in JSON format
      app.use(bodyParser.json());
      // Parse from x-www-form-urlencoded, which is the universal content type
      app.use(
        bodyParser.urlencoded({
          extended: true,
        })
      );

      // Password auth
      app.use(passport.initialize());

      // Auth middleware
      app.use(
        expressJwt({
          secret: process.env.API_ACCESS_TOKEN_SECRET,
        }).unless({
          path: [
            {
              url: `${process.env.API_VERSION}/users`,
              methods: ['OPTIONS', 'POST'],
            },
            `${process.env.API_VERSION}/auth`,
            `${process.env.API_VERSION}/auth/token`,
            `${process.env.API_VERSION}/auth/google/token`,
            `${process.env.API_VERSION}/auth/facebook/token`,
            `${process.env.API_VERSION}/auth/forgot`,
            `${process.env.API_VERSION}/auth/reset`,
            `${process.env.API_VERSION}/auth/validate`,
            // `${process.env.API_VERSION}/users/test`,
          ],
        })
      );

      // Middleware to handle error from authentication
      app.use(authErrorMidd);

      log.title('Initialization');
      log.success(`Hi! The current env is ${process.env.NODE_ENV}`);
      log.success(`Hi! The current version is ${version}`);

      await this.bootstrap();
      resolve();
    });
  }

  /**
   * Bootstrap API
   */
  static bootstrap() {
    return new Promise(async (resolve) => {
      // Routes
      app.use(`${process.env.API_VERSION}/devices`, deviceRouter);
      app.use(`${process.env.API_VERSION}/users`, userRouter);
      app.use(`${process.env.API_VERSION}/matches`, matchRouter);
      app.use(`${process.env.API_VERSION}/leagues`, leagueRouter);
      // Could use decentralized authorization server
      app.use(`${process.env.API_VERSION}/auth`, authRouter);
      app.use((req, res) => {
        res
          .status(404)
          .json({ status: 404, code: 'not_found', error: 'Not Found' });
      });

      try {
        await this.database();
        await this.listen();
        resolve();
      } catch (e) {
        log[e.type](e.obj.message);
      }
    });
  }

  /**
   * Connecting database
   */
  static database() {
    return new Promise((resolve, reject) => {
      log.info('Connecting to the database...');

      mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });

      const { connection } = mongoose;
      connection.on('error', () => {
        log.error(`Connection error to the database ${process.env.DB_NAME}`);
        reject();
      });

      connection.once('open', () => {
        log.success(`Hi! Connecting to the database ${process.env.DB_NAME}`);
        resolve();
      });
    });
  }

  /**
   * Launch server
   */
  static listen() {
    return new Promise((resolve, reject) => {
      const PORT = process.env.PORT || process.env.API_PORT;
      this.server = app.listen(PORT, (err) => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ type: 'error', obj: err });
          return;
        }

        log.success(`Server is listening on ${PORT}`);
        resolve();
      });
    });
  }
}

export default Server;
