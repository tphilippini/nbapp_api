"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nodemailerExpressHandlebars = _interopRequireDefault(require("nodemailer-express-handlebars"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Mailer {
  constructor() {
    this.from = '"NBA App" <noreply@myapp.com>'; // create reusable transporter object using the default SMTP transport

    this.transporter = _nodemailer.default.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
      }
    });
    this.transporter.use('compile', (0, _nodemailerExpressHandlebars.default)({
      viewEngine: {
        extName: '.handlebars',
        partialsDir: 'src/views/partials',
        layoutsDir: 'src/views/emails',
        defaultLayout: 'default'
      },
      viewPath: 'src/views/emails',
      extName: '.handlebars'
    }));
  }

  sendResetPasswordEmail(data, cb) {
    this.transporter.sendMail({
      from: this.from,
      to: data.email,
      subject: 'NBA App - Reseting password ✔',
      template: 'reset',
      context: data
    }, cb);
  }

}

var _default = new Mailer();

exports.default = _default;