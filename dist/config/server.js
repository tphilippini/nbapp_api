'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _helmet = _interopRequireDefault(require("helmet"));

var _cors = _interopRequireDefault(require("cors"));

var _package = require("../../package.json");

var _cors2 = _interopRequireDefault(require("../middlewares/cors"));

var _other = _interopRequireDefault(require("../middlewares/other"));

var _match = _interopRequireDefault(require("../api/matches/match.routes"));

var _log = _interopRequireDefault(require("../helpers/log"));

var _response = _interopRequireDefault(require("../helpers/response"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// import '@/scripts/cron';
var app = (0, _express.default)();

class Server {
  constructor() {
    this.server = {};
  }

  static init() {
    var _this = this;

    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (resolve) {
        // Global middlewares
        app.use((0, _helmet.default)());
        app.use((0, _cors.default)()); // CORS middleware

        app.use(_cors2.default); // A simple middleware

        app.use(_other.default); // Parse input values in JSON format

        app.use(_bodyParser.default.json()); // Parse from x-www-form-urlencoded, which is the universal content type

        app.use(_bodyParser.default.urlencoded({
          extended: true
        })); // Password auth
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
        //       `${process.env.API_VERSION}/auth/google/token`,
        //       `${process.env.API_VERSION}/auth/facebook/token`,
        //       `${process.env.API_VERSION}/auth/forgot`,
        //       `${process.env.API_VERSION}/auth/reset`,
        //       `${process.env.API_VERSION}/auth/validate`,
        //       // `${process.env.API_VERSION}/users/test`,
        //     ],
        //   })
        // );
        // // Middleware to handle error from authentication
        // app.use(authErrorMidd);

        _log.default.title('Initialization');

        _log.default.success("Hi! The current env is ".concat(process.env.NODE_ENV));

        _log.default.success("Hi! The current version is ".concat(_package.version));

        yield _this.bootstrap();
        resolve();
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  }
  /**
   * Bootstrap API
   */


  static bootstrap() {
    var _this2 = this;

    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (resolve) {
        // Routes
        // app.use(`${process.env.API_VERSION}/devices`, deviceRouter);
        // app.use(`${process.env.API_VERSION}/users`, userRouter);
        app.use("".concat(process.env.API_VERSION, "/matches"), _match.default); // app.use(`${process.env.API_VERSION}/leagues`, leagueRouter);
        // Could use decentralized authorization server
        // app.use(`${process.env.API_VERSION}/auth`, authRouter);

        app.get('/', (req, res) => {
          _response.default.success(res, 200, 'user_welcome');
        });
        app.use((req, res) => {
          res.status(404).json({
            status: 404,
            code: 'not_found',
            error: 'Not Found'
          });
        });

        try {
          yield _this2.database();
          yield _this2.listen();
          resolve();
        } catch (e) {
          _log.default[e.type](e.obj.message);
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
  }
  /**
   * Connecting database
   */


  static database() {
    return new Promise((resolve, reject) => {
      _log.default.info('Connecting to the database...');

      _mongoose.default.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      });

      var {
        connection
      } = _mongoose.default;
      connection.on('error', () => {
        _log.default.error("Connection error to the database ".concat(process.env.DB_NAME));

        reject();
      });
      connection.once('open', () => {
        _log.default.success("Hi! Connecting to the database ".concat(process.env.DB_NAME));

        resolve();
      });
    });
  }
  /**
   * Launch server
   */


  static listen() {
    return new Promise((resolve, reject) => {
      var PORT = process.env.PORT || process.env.API_PORT;
      this.server = app.listen(PORT, err => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            type: 'error',
            obj: err
          });
          return;
        }

        _log.default.success("Server is listening on ".concat(PORT));

        resolve();
      });
    });
  }

}

var _default = Server;
exports.default = _default;