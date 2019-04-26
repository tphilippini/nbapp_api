"use strict";

import uuid from "uuid";
import { isEmail, isUUID } from "validator";
import bcrypt from "bcrypt";
import EventEmitter from "events";
import ua from "useragent";

import User from "@/api/users/user.model";
import Device from "@/api/devices/device.model";

import { api } from "@/config/config";
import { generateAccessToken, generateRefreshToken } from "@/helpers/token";
import response from "@/helpers/response";
import log from "@/helpers/log";
import os from "@/helpers/os";

const userController = {};

userController.post = (req, res) => {
  log.info("Hi! Adding a user...");

  const deviceName = os.get().type;
  const agent = ua.parse(req.headers["user-agent"]);
  const uaName = agent.toString();

  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const alias = req.body.alias;
  const email = req.body.email;
  const password = req.body.password;

  // Split to avoid callbacks hell
  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!lastName || !firstName || !alias || !email || !password) {
      errors.push("missing_params");
    } else {
      if (!isEmail(email)) {
        errors.push("invalid_email_address");
      }
      if (password.length < 6) {
        errors.push("password_too_short");
      }

      if (errors.length === 0) {
        User.doesThisExist({ email }, result => {
          if (result) {
            errors.push("email_address_already_taken");
            checkEvent.emit("error", errors);
          } else {
            User.doesThisExist({ alias }, result => {
              if (result) {
                errors.push("alias_already_taken");
                checkEvent.emit("error", errors);
              } else {
                checkEvent.emit("success");
              }
            });
          }
        });
      }
    }

    if (errors.length > 0) {
      checkEvent.emit("error", errors);
    }
  };

  checkEvent.on("error", err => {
    response.error(res, 400, err);
  });

  checking();

  checkEvent.on("success", () => {
    /**
     * Generate password with 2^12 (4096) iterations for the algo.
     * Safety is priority here, performance on the side in this case
     * Become slower, but this is to "prevent" more about brute force attacks.
     * It will take more time during matching process, then more time to reverse it
     */
    bcrypt.hash(password, 12, (err, hash) => {
      const newUser = {
        lastName,
        firstName,
        alias,
        email,
        password: hash,
        uuid: uuid.v4()
      };

      const deviceId = uuid.v4();
      const accessToken = generateAccessToken(deviceId, newUser.uuid, "user");
      const refreshToken = generateRefreshToken(deviceId);

      User.add(newUser, () => {
        const newDevice = {
          uuid: deviceId,
          userId: newUser.uuid,
          userType: "user",
          refreshToken: refreshToken,
          name: deviceName,
          ua: uaName
        };

        Device.add(newDevice, () => {
          /**
           * Use Location header to redirect here
           * For next 201 code, we should have the URL relatives to the new ressource
           * Ex: /users/:uuid
           */
          response.successAdd(res, "user_added", "/auth/token", {
            access_token: accessToken,
            token_type: "bearer",
            expires_in: api().access_token.exp,
            refresh_token: refreshToken,
            client_id: deviceId
          });
        });
      });
    });
  });
};

userController.patch = (req, res) => {
  log.info("Hi! Editing an user...");

  const grantType = req.body.grant_type;
  const userType = req.body.user_type;

  const checkEvent = new EventEmitter();

  const checking = () => {
    const errors = [];

    if (!grantType) {
      errors.push("missing_params");
    } else {
      const allowedUserTypes = ["user"];

      if (grantType === "update") {
        log.info("Hi! Updating...");

        const firstName = req.body.firstname;
        const lastName = req.body.lastname;
        const alias = req.body.alias;
        const email = req.body.email;
        const uuid = req.params.uuid;

        if (!lastName || !firstName || !alias || !email || !uuid || !userType) {
          errors.push("missing_params");
        } else {
          if (allowedUserTypes.indexOf(userType) === -1) {
            errors.push("invalid_user_type");
          }
          if (!isUUID(uuid)) {
            errors.push("invalid_client");
          }
          if (!isEmail(email)) {
            errors.push("invalid_email_address");
          }
          if (alias.length < 4) {
            errors.push("alias_too_short");
          }

          if (errors.length === 0) {
            User.findOneByUUID(uuid, result => {
              if (result) {
                if (result.uuid == uuid) {
                  if (result.email == email) {
                    User.doesThisExist(
                      { alias, uuid: { $ne: uuid } },
                      exists => {
                        if (exists) {
                          errors.push("alias_already_taken");
                          checkEvent.emit("error", errors);
                        } else {
                          result.alias = alias;
                          result.firstName = firstName;
                          result.lastName = lastName;

                          checkEvent.emit("success_update_grant", result);
                        }
                      }
                    );
                  } else {
                    errors.push("invalid_credentials");
                    checkEvent.emit("error", errors);
                  }
                } else {
                  errors.push("invalid_credentials");
                  checkEvent.emit("error", errors);
                }
              } else {
                errors.push("invalid_credentials");
                checkEvent.emit("error", errors);
              }
            });
          }
        }
      } else if (grantType === "password") {
        log.info("Hi! Updating password...");
      } else if (grantType === "confirmed") {
        log.info("Hi! Updating confirmation...");
      } else {
        errors.push("invalid_grant_type");
      }
    }

    if (errors.length > 0) {
      checkEvent.emit("error", errors);
    }
  };

  checkEvent.on("error", err => {
    let status = 400;
    response.error(res, status, err);
  });

  checking();

  checkEvent.on("success_update_grant", result => {
    User.update(result, user => {
      response.success(res, 200, "user_updated");
    });
  });
};

userController.getAll = (req, res) => {
  log.info("Hi! Getting all of the users...");
  User.getAll(result => {
    res.json(result);
  });
};

userController.getCurrent = (req, res) => {
  log.info("Hi! Getting current user...");
  res.json({
    user: {
      email: req.user.email,
      alias: req.user.alias
    }
  });
};

export default userController;
