"use strict";

// Should use trim() to be sure we do not have white space (cf Windows)
if (typeof process.env.NODE_ENV !== "undefined") {
  process.env.NODE_ENV = process.env.NODE_ENV.trim();
} else {
  process.env.NODE_ENV = "dev";
}

const app = () => {
  const conf = {
    test: {
      host: "localhost",
      port: 3000
    },
    dev: {
      host: "localhost",
      port: 3000
    },
    prod: {
      host: "localhost",
      port: 3000
    }
  };

  return conf[process.env.NODE_ENV];
};

const api = () => {
  const conf = {
    test: {
      host: "localhost",
      port: 1336,
      version: "/v1",
      access_token: {
        secret: "my-secret-key",
        exp: 3600
      },
      refresh_token: {
        salt: "another-secret-key",
        exp: 3600 * 24 * 7
      },
      reset_token: {
        secret: "reset-secret-key",
        exp: 3600
      }
    },
    dev: {
      host: "localhost",
      port: 1337,
      version: "/v1",
      access_token: {
        secret: "my-secret-key",
        exp: 3600 // Token valid for 1 hour
      },
      refresh_token: {
        salt: "another-secret-key",
        exp: 3600 * 24 * 7 // Token valid for 7 days
      },
      reset_token: {
        secret: "reset-secret-key",
        exp: 3600
      }
    },
    prod: {
      host: "localhost",
      port: 1337,
      version: "/v1",
      access_token: {
        secret: "my-secret-key",
        exp: 3600
      },
      refresh_token: {
        salt: "another-secret-key",
        exp: 3600 * 24 * 7
      },
      reset_token: {
        secret: "reset-secret-key",
        exp: 3600
      }
    }
  };

  return conf[process.env.NODE_ENV];
};

const db = () => {
  const conf = {
    test: {
      hostname: "localhost",
      name: "fanjam_test_db"
    },
    dev: {
      hostname: "localhost",
      name: "fanjam_db"
    },
    prod: {
      hostname: "localhost",
      name: "fanjam_db"
    }
  };

  return conf[process.env.NODE_ENV];
};

const youtube = () => {
  const conf = {
    test: {
      client_id:
        "1084552878641-ldbluvt0obj7ttdd1glr70ima4i7unq9.apps.googleusercontent.com",
      client_secret: "wY-8xQN97bolY7aZn0ZTDrf5",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
    },
    dev: {
      client_id:
        "1084552878641-ldbluvt0obj7ttdd1glr70ima4i7unq9.apps.googleusercontent.com",
      client_secret: "wY-8xQN97bolY7aZn0ZTDrf5",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
    },
    prod: {
      client_id:
        "1084552878641-ldbluvt0obj7ttdd1glr70ima4i7unq9.apps.googleusercontent.com",
      client_secret: "wY-8xQN97bolY7aZn0ZTDrf5",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
    }
  };

  return conf[process.env.NODE_ENV];
};

const ytChannel = [
  { title: "MLG Highlights", id: "UC-XWpctw55Q6b_AHo8rkJgw" },
  { title: "Free dawkins", id: "UCEjOSbbaOfgnfRODEEMYlCw" },
  // { title: "Ximo Pierto", id: "UC8ndn9yAGs5L8NqKUBKzfyw" },
  { title: "CliveNBAParody", id: "UCSGkhjEMPDq0iPb0JHb_w5Q" }

  // { title: "House of highlights", id: "UCqQo7ewe87aYAe7ub5UqXMw" },
  // { title: 'Rapid Highlights', id: 'UCdxB6UoY7VggXoaOSvEhSjg' }
];

const mail = () => {
  const conf = {
    test: {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "07db3c7b2af442",
        pass: "cb8e99e2339ff3"
      }
    },
    dev: {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "07db3c7b2af442",
        pass: "cb8e99e2339ff3"
      }
    },
    prod: {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "07db3c7b2af442",
        pass: "cb8e99e2339ff3"
      }
    }
  };

  return conf[process.env.NODE_ENV];
};

export { app, api, db, youtube, mail, ytChannel };
