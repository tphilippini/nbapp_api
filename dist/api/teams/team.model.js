"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TeamsSchema = new _mongoose.default.Schema({
  id: Number,
  isNBAFranchise: Boolean,
  city: String,
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  teamName: String,
  teamShortName: String,
  teamTriCode: String,
  confName: String,
  divName: String
}); // eslint-disable-next-line func-names

TeamsSchema.statics.findOneByTeamId = function (teamId) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    this.findOne({
      teamId
    }, (error, result) => {
      if (error) {
        return reject(error);
      }

      resolve(result);
    }).select('-__v').select('-_id');
  });
};

var Teams = _mongoose.default.model('Teams', TeamsSchema, 'Teams');

var _default = Teams;
exports.default = _default;