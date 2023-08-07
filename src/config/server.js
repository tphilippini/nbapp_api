'use strict';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import date from '@/helpers/date';
// import leagueRouter from '@/api/leagues/league.routes';
// import corsMidd from '@/middlewares/cors';
import log from '@/helpers/log';
import matchRouter from '@/api/matches/match.routes';
import authRouter from '@/api/auth/auth.routes';
// import expressJwt from 'express-jwt';
import otherMidd from '@/middlewares/other';
import response from '@/helpers/response';
// import deviceRouter from '@/api/devices/device.routes';
import userRouter from '@/api/users/user.routes';

// import passport from '@/config/passport';

// import authErrorMidd from '@/middlewares/authError';
// import '@/scripts/cron';

const app = express();

class Server {
  static async init() {
    // Global middlewares
    app.use(helmet());
    app.use(cors());

    // CORS middleware
    // app.use(corsMidd);

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
    // app.use(passport.initialize());

    // Auth middleware
    // app.use(
    //   expressJwt({
    //     secret: process.env.API_ACCESS_TOKEN_SECRET,
    //   }).unless({
    //     path: [
    //       {
    //         url: `${process.env.API_VERSION}/users`,
    //         methods: ['OPTIONS', 'POST'],
    //       },
    //       `${process.env.API_VERSION}/auth`,
    //       `${process.env.API_VERSION}/auth/token`,
    //       // `${process.env.API_VERSION}/auth/google/token`,
    //       // `${process.env.API_VERSION}/auth/facebook/token`,
    //       `${process.env.API_VERSION}/auth/forgot`,
    //       `${process.env.API_VERSION}/auth/reset`,
    //       `${process.env.API_VERSION}/auth/validate`,
    //       // `${process.env.API_VERSION}/users/test`,
    //     ],
    //   })
    // );

    // Middleware to handle error from authentication
    // app.use(authErrorMidd);

    log.title('Initialization');
    log.success(`The current env is ${process.env.NODE_ENV}`);
    log.success(`The current version is ${process.env.VERSION}`);
    log.success(`The current time zone is ${date.timeZone()}`);

    await Server.bootstrap();
  }

  /**
   * Bootstrap API
   */
  static async bootstrap() {
    // Routes
    // app.use(`${process.env.API_VERSION}/devices`, deviceRouter);
    app.use(`${process.env.API_VERSION}/users`, userRouter);
    app.use(`${process.env.API_VERSION}/matches`, matchRouter);
    // app.use(`${process.env.API_VERSION}/leagues`, leagueRouter);
    // Could use decentralized authorization server
    app.use(`${process.env.API_VERSION}/auth`, authRouter);

    app.get('/', (req, res) => {
      response.success(res, 200, 'user_welcome');
    });

    app.use((req, res) => {
      res
        .status(404)
        .json({ status: 404, code: 'not_found', error: 'Not Found' });
    });

    try {
      await Server.database();
      await Server.listen();
    } catch (e) {
      log[e.type](e.obj.message);
    }
  }

  /**
   * Connecting database
   */
  static database() {
    mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    const { connection } = mongoose;
    connection.on('error', () => {
      log.error(`Connection error to the database ${process.env.DB_NAME}`);
    });

    connection.once('open', () => {
      log.success(`Connecting to the database ${process.env.DB_NAME}`);
    });
  }

  /**
   * Launch server
   */
  static async listen() {
    const PORT = process.env.PORT || process.env.API_PORT;
    await app.listen(PORT);
    log.success(`Server is listening on ${PORT}`);
  }
}

export default Server;
