'use strict';

import express from 'express';
import bodyParser from 'body-parser';
// import expressJwt from 'express-jwt';

import { api } from './config';

// import corsMidd from '../middlewares/cors';
// import otherMidd from '../middlewares/other';
// import authErrorMidd from '../middlewares/authError';

// import deviceRouter from '../devices/device.routes';
// import userRouter from '../users/user.routes';
// import authRouter from '../auth/auth.routes';

import log from '../helpers/log';

const app = express();

class Server {
  static init() {
    // Global middlewares

    // CORS middleware
    // app.use(corsMidd);

    // A simple middleware
    // app.use(otherMidd);

    // Parse input values in JSON format
    app.use(bodyParser.json());
    // Parse from x-www-form-urlencoded, which is the universal content type
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    // Auth middleware
    // app.use(expressJwt({
    //   secret: api().access_token.secret
    // }).unless({
    //   path: [
    //     { url: `${api().version}/users`, methods: ['OPTIONS', 'POST'] },
    //     `${api().version}/auth`,
    //     `${api().version}/auth/token`,
    //     `${api().version}/auth/forgot`,
    //     `${api().version}/auth/reset`,
    //     `${api().version}/auth/validate`
    //   ]
    // }));

    // Middleware to handle error from authentication
    // app.use(authErrorMidd);

    log.title('Initialization');
    log.success(`Hi! The current env is ${process.env.NODE_ENV}`);

    this.bootstrap();
  }

  static bootstrap() {
    // Routes
    // app.use(`${api().version}/devices`, deviceRouter);
    // app.use(`${api().version}/users`, userRouter);
    // // Could use decentralized authorization server
    // app.use(`${api().version}/auth`, authRouter);

    this.listen();
  }

  static listen() {
    // Listen
    app.listen(api().port, (err) => {
      if (err) throw err;
      log.success(`Hi! Server is listening on ${api().port}`);
    });
  }
}

export default Server;
