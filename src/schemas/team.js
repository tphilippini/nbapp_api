import mongoose from 'mongoose'

const TeamSchema = new mongoose.Schema({

  id: Number,

  isNBAFranchise: Boolean,

  city: String,

  teamId: { type: String, required: true, unique: true },

  teamName: String,

  teamShortName: String,

  teamTriCode: String,

  confName: String,

  divName: String
});

module.exports = TeamSchema;
