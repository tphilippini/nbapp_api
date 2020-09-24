'use strict';

// Should use trim() to be sure we do not have white space (cf Windows)
// if (typeof process.env.NODE_ENV !== "undefined") {
//   process.env.NODE_ENV = process.env.NODE_ENV.trim();
// } else {
//   process.env.NODE_ENV = "development";
// }

// const app = () => {
//   const conf = {
//     test: {
//       host: "localhost",
//       port: 3000,
//     },
//     dev: {
//       host: "localhost",
//       port: 3000,
//     },
//     prod: {
//       host: "localhost",
//       port: 3000,
//     },
//   };

//   return conf[process.env.NODE_ENV];
// };

// const api = {
//   host: process.env.API_HOST,
//   port: process.env.API_PORT,
//   version: process.env.API_VERSION,
//   access_token: {
//     secret: process.env.API_ACCESS_TOKEN_SECRET,
//     exp: process.env.API_ACCESS_TOKEN_EXP, // Token valid for 1 hour
//   },
//   refresh_token: {
//     salt: process.env.API_REFRESH_TOKEN_SALT,
//     exp: 3600 * 24 * 7, // Token valid for 7 days
//   },
//   reset_token: {
//     secret: process.env.API_RESET_TOKEN_SECRET,
//     exp: process.env.API_RESET_TOKEN_EXP,
//   },
// };

// const youtube = {
//   client_id:
//     "1084552878641-ldbluvt0obj7ttdd1glr70ima4i7unq9.apps.googleusercontent.com",
//   client_secret: "55OHcGoNB2_khIjAbrm6mCaK",
//   redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
// };

const ytChannel = [
  { title: 'MLG Highlights', id: 'UC-XWpctw55Q6b_AHo8rkJgw' },
  // { title: "Free dawkins", id: "UCEjOSbbaOfgnfRODEEMYlCw" },
  // { title: "Ximo Pierto", id: "UC8ndn9yAGs5L8NqKUBKzfyw" },
  // { title: "CliveNBAParody", id: "UCSGkhjEMPDq0iPb0JHb_w5Q" }

  // { title: "House of highlights", id: "UCqQo7ewe87aYAe7ub5UqXMw" },
  // { title: 'Rapid Highlights', id: 'UCdxB6UoY7VggXoaOSvEhSjg' }
];

// const mailConfig = {
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   auth: {
//     user: process.env.MAIL_AUTH_USER,
//     pass: process.env.MAIL_AUTH_PASS,
//   },
// };

// eslint-disable-next-line import/prefer-default-export
export { ytChannel };
