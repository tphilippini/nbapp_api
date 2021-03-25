"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DevicesSchema = new _mongoose.default.Schema({
  id: Number,
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Users'
  },
  // userId: { type: String, required: true, index: true },
  userType: String,
  refreshToken: {
    type: String,
    unique: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    lowercase: true,
    required: true
  },
  ua: {
    type: String,
    lowercase: true,
    required: true
  }
}, {
  timestamps: true
});

var Devices = _mongoose.default.model('Devices', DevicesSchema, 'Devices');

var _default = Devices;
exports.default = _default;