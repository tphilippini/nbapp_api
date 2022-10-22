import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';

class Mailer {
  _setTransporter() {
    this.from = '"NBA App" <noreply@myapp.com>';
    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extName: '.handlebars',
          partialsDir: 'src/views/partials',
          layoutsDir: 'src/views/emails',
          defaultLayout: 'default',
        },
        viewPath: 'src/views/emails',
        extName: '.handlebars',
      })
    );
  }

  sendSignUpEmail(data, cb) {
    this._setTransporter();
    this.transporter.sendMail(
      {
        from: this.from,
        to: data.email,
        subject: 'NBA App - Confirm your account ✔',
        template: 'signup',
        context: data,
      },
      cb
    );
  }

  sendResetPasswordEmail(data, cb) {
    this._setTransporter();
    this.transporter.sendMail(
      {
        from: this.from,
        to: data.local.email,
        subject: 'NBA App - Reseting password ✔',
        template: 'reset',
        context: {
          alias: data.alias,
          link: data.link,
        },
      },
      cb
    );
  }
}

export default new Mailer();
