'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import mongoose from 'mongoose';

import { api, db } from '@/config/config';
// import conn from '@/config/database';
import passport from '@/config/passport';

import { version } from '@@/package.json';

import corsMidd from '@/middlewares/cors';
import otherMidd from '@/middlewares/other';
import authErrorMidd from '@/middlewares/authError';

import deviceRouter from '@/api/devices/device.routes';
import userRouter from '@/api/users/user.routes';
import matchRouter from '@/api/matches/match.routes';
import authRouter from '@/api/auth/auth.routes';

// import models, { connectDb } from '@/models';

import log from '@/helpers/log';

const app = express();

class Server {
  constructor() {
    this.server = {};
  }

  static init() {
    return new Promise(async resolve => {
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
          extended: true
        })
      );

      // Password auth
      app.use(passport.initialize());

      // Auth middleware
      app.use(
        expressJwt({
          secret: api().access_token.secret
        }).unless({
          path: [
            { url: `${api().version}/users`, methods: ['OPTIONS', 'POST'] },
            `${api().version}/auth`,
            `${api().version}/auth/token`,
            `${api().version}/auth/google/token`,
            `${api().version}/auth/facebook/token`,
            `${api().version}/auth/forgot`,
            `${api().version}/auth/reset`,
            `${api().version}/auth/validate`
          ]
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
    return new Promise(async resolve => {
      // Routes
      app.use(`${api().version}/devices`, deviceRouter);
      app.use(`${api().version}/users`, userRouter);
      app.use(`${api().version}/matches`, matchRouter);
      // Could use decentralized authorization server
      app.use(`${api().version}/auth`, authRouter);
      app.use(function(req, res) {
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
      const DATABASE_URL = `mongodb://${db().hostname}/${db().name}`;

      mongoose.connect(DATABASE_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      });

      const connection = mongoose.connection;
      connection.on('error', () => {
        log.error(`Connection error to the database ${db().name}`);
        reject();
      });

      connection.once('open', () => {
        log.success(`Hi! Connecting to the database ${db().name}`);
      });

      resolve();
    });
  }

  /**
   * Launch server
   */
  static listen() {
    return new Promise((resolve, reject) => {
      this.server = app.listen(api().port, err => {
        if (err) {
          reject({ type: 'error', obj: err });
          return;
        }

        log.success(`Server is listening on ${api().port}`);
        resolve();
      });
    });
  }
}

export default Server;
