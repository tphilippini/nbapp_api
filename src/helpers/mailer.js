import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { mail } from "@/config/config";

class Mailer {
  constructor() {
    this.from = '"NBA App" <noreply@myapp.com>';
    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport(mail());

    this.transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".handlebars",
          partialsDir: "src/views/partials",
          layoutsDir: "src/views/emails",
          defaultLayout: 'default',
        },
        viewPath: "src/views/emails",
        extName: ".handlebars"
      })
    );
  }

  sendResetPasswordEmail(data, cb) {
    this.transporter.sendMail(
      {
        from: this.from,
        to: data.email,
        subject: "MyApp - Reseting password ✔",
        template: "reset",
        context: data
      },
      cb
    );
  }
}

export default new Mailer();
